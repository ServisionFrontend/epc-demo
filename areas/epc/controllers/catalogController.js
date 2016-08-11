"use strict";

let gu = require('guthrie-js');
let baseController = require('../../../common/baseController');
let catalogController = new gu.controller.inherit(baseController);
let BrandModel = require('../../../models/common/BrandModel');
let ModelModel = require('../../../models/common/ModelModel');

catalogController.actions = {
	index: {
		GET: function*(req, res) {
			let brand = new BrandModel(req, res);
			let model = new ModelModel(req, res);

			let brands = yield brand.find();
			let brandCode = getBrandCode(req.query.bc, brands);
			let seriesCode = getSeriesCode(brandCode, req.query.sc, brands);
			let models = yield model.find(seriesCode);

			let result = {
				brandCode: brandCode,
				seriesCode: seriesCode,
				brands: rebuildBrands(brands, seriesCode),
				models: models,
				crumbs: getCrumbs(brandCode, seriesCode, brands)
			};

			if (req.headers['x-pjax']) {
				res.json(result);
			} else {
				res.render('catalog/index', result);
			}
		}
	}
};

function getCrumbs(brandCode, seriesCode, brands) {
	let crumbs = [];

	brands.forEach(function(brand) {
		if (brand.code === brandCode) {
			crumbs.push({
				label: '品牌',
				code: brand.code,
				text: brand.name,
				params: 'bc=' + brand.code
			});
		}

		brand.series.forEach(function(series) {
			if (series.code === seriesCode) {
				crumbs.push({
					label: '车系',
					code: series.code,
					text: series.name,
					params: 'bc=' + brandCode + '&sc=' + series.code
				});
			}
		});

		if (crumbs.length === 2) {
			return true;
		}
	});

	return crumbs;
}

function getBrandCode(brandCode, brands) {

	return brandCode || (brands.length > 0 ? brands[0].code : '');
}

function getSeriesCode(brandCode, seriesCode, brands) {

	if (seriesCode) return seriesCode;

	brands.forEach(function(brand, idx) {

		if (brand.code === brandCode) {
			seriesCode = brand.series.length ? brand.series[0].code : '';
			return true;
		}
	});

	return seriesCode;
}

function rebuildBrands(brands, seriesCode) {
	brands = !Array.isArray(brands) ? [] : brands;

	brands.forEach(function(brand, idx) {

		brand.series.forEach(function(series, idx) {
			if (series.code === seriesCode) {
				brand.activeCode = series.code;
			}
		});
		if (!brand.activeCode && brand.series.length) {
			brand.activeCode = brand.series[0].code;
		}
	});

	return brands;
}


module.exports = catalogController;