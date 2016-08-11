
define(["jquery"], function () {
    var settings = globalConfig;
    var CATEGORYS = {
       

    },
    ACTIONS = {
       
    },
    EVENTS = {
       
    },
    local = window.location,
    url = settings.context.trackUrl,
    trackEnable = settings.context.trackEnabled,
    lang = settings.context.lang,
    localUrl = local.pathname + "/" + (typeof local.search === "undefined" ? "" : local.search);

    return {

        /**
         * description: The user operation is sent to the server side
         * @category {string} Page category operation area 
         * @action {string} user operation action
         * @event {string} user operation event type (click 、dblclick...)
         * @label {string} The current operation object labels
         * @value {string} User behavior description
         */
        publish: function (category, action, event, value) {
            var params = {
                url: localUrl,
                cat: CATEGORYS[category],
                name: ACTIONS[action],
                type: EVENTS[event],
                parm: value,
                lang: lang
            };
            if (Boolean(trackEnable))
                $.post(url, params);
        }

    };
});