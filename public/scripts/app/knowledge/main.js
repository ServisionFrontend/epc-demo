require(['ajax', 'mustache', 'header', 'jquery', 'jqExtend'],
  function (ajax, Mustache, Header, $) {

    var knowledge = {

      init: function () {
        var self = this;

        self.bindEls();
        self.initComponent();
        self.initJSONPCallback();
        self.getData();
      },

      bindEls: function () {
        var self = this;

        self.$template = $('#template-knowledge');
        self.$boxKnowledge = $('#box-knowledge');
      },


      initComponent: function () {
        var self = this;

        self.header = new Header();
        self.template = self.$template.html();
      },

      initJSONPCallback: function () {
        var self = this;
        window.showKnowledge = function (data) {

          var list = self.rebuildData(data);
          var output = Mustache.render(self.template, {list: list});

          self.$boxKnowledge.html(output);

        };
      },
      rebuildData: function (data) {
        var self = this;

        for (var i = 0; i < data.length; i++) {
          data[i].mtime = data[i].mtime && self.formatDate(data[i].mtime, 'yyyy-MM-dd HH:mm:ss');
          data[i].size = data[i].size && (parseInt(data[i].size) / 1024).toFixed(2) || 0;
          data[i].url = (globalConfig.context.jsonpUrl + '/' + data[i].name) || '#';
          data[i].className = data[i].name && self.getClassName(data[i].name) || '';
        }

        return data;
      },

      formatDate: function (time, format) {
        var self = this;
        var time = new Date(time);
        var timeFormat = function (i) {
          return (i < 10 ? '0' : '') + i;
        };

        return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
          switch (a) {
            case 'yyyy':
              return timeFormat(time.getFullYear());
              break;
            case 'MM':
              return timeFormat(time.getMonth() + 1);
              break;
            case 'mm':
              return timeFormat(time.getMinutes());
              break;
            case 'dd':
              return timeFormat(time.getDate());
              break;
            case 'HH':
              return timeFormat(time.getHours());
              break;
            case 'ss':
              return timeFormat(time.getSeconds());
              break;
          }
        })
      },

      getClassName: function (filename) {
        var self = this;
        var dotIndex = filename.lastIndexOf('.');

        return filename.substring(dotIndex + 1, filename.length);
      },

      getData: function () {
        ajax.invoke({
          url: globalConfig.context.jsonpUrl,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'callback',
          jsonpCallback: 'showKnowledge',
          success: function (root) {
          }
        });
      }
    };

    knowledge.init();
  });