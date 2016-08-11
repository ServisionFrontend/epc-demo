var initRoutesMap = function (router) {

  var pacArea = router.createArea('pac');
  var epcArea = router.createArea('epc');
  var commonArea = router.createArea('common');

  pacArea.mapRoute('/pac/:controller/:action?/:id?');
  epcArea.mapRoute('/epc/:controller?/:action?/:type?');
  
  commonArea.mapRoute('/', {
    controller: 'login',
    action: 'index'
  });

  commonArea.mapRoute('/login/dmsLogin', {
    controller: 'login',
    action: 'dmsLogin'
  });

  commonArea.mapRoute('/delete/epc-cache', {
    controller: 'deleteCache',
    action: 'index'
  });

  commonArea.mapRoute('/:controller?/:action?/:id?');
  
  router.mapRoute('/common/:type', {
    controller: 'common',
    action: 'index'
  });

  router.mapRoute('/combo/:type', {
    controller: 'combo',
    action: 'index'
  });

  router.mapRoute('/pac/online/:name', {
    controller: 'pac',
    action: 'online'
  });

  router.mapRoute('/:controller/:action?');

  router.mapRoute('/', {
    controller: 'login',
    action: 'index'
  });

};

module.exports = initRoutesMap;