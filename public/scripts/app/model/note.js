define(['jquery'], function () {

	var Note = function () {
		this.init();
	};

	Note.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindAttr();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$parts = $('#parts');
			self.$note = $('#parts-note');
		},

		bindAttr: function () {
			var self = this;

			self.showTimer = null;
			self.hideTimer = null;
		},

		bindEvent: function () {
			var self = this;

			self.$parts.on('mouseenter', '.item.remark', function (e) {
				if($(this).val().length === 0) return;				

				self.clearHideTimer();
				self.setNoteValue($(this));
				self.caculateNote($(this));
				self.showNote();
			}).on('mouseleave', '.item.remark', function () {
				if($(this).val().length === 0) return;

				self.clearShowTimer();
				self.hideNote();
			});

			self.$note.on({
				mouseenter: function () {
					self.clearHideTimer();
					self.showNote();
				},
				mouseleave: function () {
					self.clearShowTimer();
					self.hideNote();
				}
			})
		},

		clearShowTimer: function () {
			var self = this;

			clearTimeout(self.showTimer);
		},

		clearHideTimer: function () {
			var self = this;

			clearTimeout(self.hideTimer);
		},

		showNote: function () {
			var self = this;

			self.showTimer = setTimeout(function () {
				self.$note.show();
			}, 500)
		},

		hideNote: function () {
			var self = this;

			self.hideTimer = setTimeout(function () {
				self.$note.hide();
			}, 500)
		},

		setNoteValue: function ($target) {
			var self = this,
				$row = $target.closest('[data-field=row]'),
				partNote = $row.attr('data-partNote'),
				usageNote = $row.attr('data-usageNote');

			self.$note.find('.part-note').text(partNote);
			self.$note.find('.usage-note').text(usageNote);
		},

		caculateNote: function ($target) {
			var self = this,
				offset = $target.offset(),
				left = offset.left,
				top = offset.top,
				targetHeight = $target.outerHeight(),
				targetWidth = $target.outerWidth(),
				height = self.$note.outerHeight(),
				width = self.$note.outerWidth(),
				winHeight = $(window).height();

			self.$note.removeClass('top bottom')
				.css('left', left + (targetWidth / 2) - (width / 2));

			if(top + targetHeight + height <= winHeight) {
				self.$note.addClass('bottom')
					.css('top', top + targetHeight);
			} else {
				self.$note.addClass('top')
					.css('top', top - height - 6);		// 6 is arrow height
			}
		}

	};

	return Note;

});