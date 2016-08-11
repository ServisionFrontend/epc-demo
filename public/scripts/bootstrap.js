var loadScriptPaths = {
  login: {
    development: ['login/main.js'],
    release: ['login.min.js']
  },
  home: {
    development: [],
    release: []
  },
  catalog: {
    development: ['catalog/main.js'],
    release: ['catalog.min.js']
  },
  model: {
    development: ['model/main.js'],
    release: ['model.min.js']
  },
  usage: {
    development: ['usage/main.js'],
    release: ['usage.min.js']
  },
  detail: {
    development: ['detail/main.js'],
    release: ['detail.min.js']
  },
  knowledge: {
    development: ['knowledge/main.js'],
    release: ['knowledge.min.js']
  },
  cart: {
    development: ['cart/main.js'],
    release: ['cart.min.js']
  },
  order: {
    development: ['order/main.js'],
    release: ['order.min.js']
  },
  order_detail: {
    development: ['order/detail.js'],
    release: ['order_detail.min.js']
  },
  survey: {
    development: ['pac/survey/main.js'],
    release: ['pac_survey.min.js']
  },
  online: {
    development: ['pac/online/main.js'],
    release: ['pac_online.min.js']
  },
  pac_detail: {
    development: ['pac/online/detail/main.js'],
    release: ['pac_online_detail.min.js']
  },
  myquestion: {
    development: ['pac/online/myquestion.js'],
    release: ['pac_myquestion.min.js']
  },
  question_search: {
    development: ['pac/online/question_search.js'],
    release: ['pac_question_search.min.js']
  },
  pwdInfo: {
    development: ['pwdInfo/main.js'],
    release: ['pwdInfo.min.js']
  },
  step_second: {
    development: ['pwdInfo/step_second.js'],
    release: ['step_second.min.js']
  },
  step_third: {
    development: ['pwdInfo/step_third.js'],
    release: ['step_third.min.js']
  }
};

(function () {
  var requireConfig = require.s.contexts._.config,
    loadModule = loadScriptPaths[pageConfig.pageCode],
    loadScriptSrc, baseUrl = requireConfig.baseUrl;

  var buildUrl = function (paths) {
    for (var i = 0; i < paths.length; i++) {
      if (pageConfig.isLocal) {
        paths[i] = baseUrl + 'app/' + paths[i];
      } else {
        paths[i] = '/release/scripts/' + paths[i] + "?v=" + pageConfig.releaseVersion;
      }
    }
    return paths;
  };

  if (pageConfig.isLocal) {
    if (loadModule && loadModule.development) {
      loadScriptSrc = buildUrl(loadModule.development);
      require(loadScriptSrc);
    }
  } else {
    if (loadModule && loadModule.release) {
      loadScriptSrc = buildUrl(loadModule.release);
      require(["jquery"], function () {
        require(loadScriptSrc);
      });
    }
  }
})();