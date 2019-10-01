// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/contextMenu',
  'app/fa-ot/templates/dataTable',
  'datatables.net',
  'datatables.net-scroller'
], function(
  _,
  $,
  t,
  View,
  contextMenu,
  template
) {
  'use strict';

  var COLUMN_MAP = {
    no: {
      width: '110px',
      render: function(data, type, row)
      {
        if (type === 'display')
        {
          return '<a href="#fa/ot/' + row._id + '">' + data + '</a>';
        }

        return data;
      }
    },
    date: {
      width: '60px'
    },
    stage: {
      width: '70px'
    },
    sapNo: {
      width: '70px'
    },
    assetName: {
      width: '200px'
    },
    inventoryNo: {
      width: '120px'
    },
    value: {
      className: 'text-right',
      width: '95px'
    },
    costCenter: {
      width: '70px'
    },
    filler: {
      orderable: false,
      defaultContent: '',
      title: '',
      width: 'auto',
      className: 'dataTables_filler'
    }
  };
  var COLUMN_LIST = [];

  return View.extend({

    template: template,

    events: {
      'contextmenu th': function(e)
      {
        e.preventDefault();

        var column = COLUMN_LIST[this.dt.column(e.currentTarget).index()];

        if (column.name === 'filler')
        {
          return;
        }

        var menu = [

        ];

        contextMenu.show(this, e.pageY, e.pageX, menu);
      }
    },

    initialize: function()
    {
      if (!COLUMN_LIST.length)
      {
        _.forEach(COLUMN_MAP, this.setUpColumn, this);
      }

      $(window).on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    setUpColumn: function(column, name)
    {
      column.name = name;
      column.index = COLUMN_LIST.length;

      if (!column.data)
      {
        column.data = name;
      }

      if (column.title == null)
      {
        column.title = t.has('fa-ot', 'LIST:COLUMN:' + name)
          ? t('fa-ot', 'LIST:COLUMN:' + name)
          : t('fa-ot', 'PROPERTY:' + name);
      }

      COLUMN_LIST.push(column);
    },

    beforeRender: function()
    {
      if (this.dt)
      {
        this.dt.destroy();
        this.dt = null;
      }
    },

    sortToOrder: function()
    {
      var view = this;
      var order = [];

      _.forEach(view.collection.rqlQuery.sort, function(dir, column)
      {
        order.push([COLUMN_MAP[column].index, dir === 1 ? 'asc' : 'desc']);
      });

      return order;
    },

    orderToSort: function(data)
    {
      var sort = {};

      data.order.forEach(function(o)
      {
        sort[data.columns[o.column].data] = o.dir === 'asc' ? 1 : -1;
      });

      return sort;
    },

    getScrollY: function()
    {
      var win = window.innerHeight;
      var hd = $('.page > .hd').outerHeight(true);
      var ft = $('.page > .ft').outerHeight(true);
      var th = $('.dataTables_scrollHead').outerHeight(true) || 50;
      var margins = 20;
      var scrollY = win - hd - ft - th - margins;

      return Math.max(300, scrollY);
    },

    afterRender: function()
    {
      var view = this;

      view.dt = view.$id('dt').DataTable({ // eslint-disable-line new-cap
        autoWidth: false,
        searching: false,
        ordering: true,
        order: view.sortToOrder(),
        paging: true,
        info: false,
        processing: true,
        deferRender: true,
        scroller: {
          loadingIndicator: true,
          displayBuffer: 2,
          boundaryScale: 0.75,
          rowHeight: 31
        },
        scrollX: true,
        scrollY: view.getScrollY(),
        serverSide: true,
        ajax: function(data, callback)
        {
          Object.assign(view.collection.rqlQuery, {
            skip: data.start,
            limit: data.length,
            sort: view.orderToSort(data)
          });

          var req = view.promised(view.collection.fetch({reset: true}));

          req.done(function()
          {
            var totalCount = view.collection.paginationData.get('totalCount');

            callback({
              draw: data.draw,
              data: view.collection.invoke('serializeRow'),
              recordsTotal: totalCount,
              recordsFiltered: totalCount
            });
          });

          req.fail(function()
          {
            callback({
              draw: data.draw,
              data: [],
              recordsTotal: 0,
              recordsFiltered: 0,
              error: 'REQUEST_FAILURE'
            });
          });
        },
        language: {
          decimal: view.t('core', 'dataTables:decimal'),
          processing: view.t('core', 'dataTables:processing'),
          search: view.t('core', 'dataTables:search'),
          lengthMenu: view.t('core', 'dataTables:lengthMenu'),
          info: view.t('core', 'dataTables:info'),
          infoEmpty: view.t('core', 'dataTables:infoEmpty'),
          infoFiltered: view.t('core', 'dataTables:infoFiltered'),
          infoPostFix: view.t('core', 'dataTables:infoPostFix'),
          loadingRecords: view.t('core', 'dataTables:loadingRecords'),
          loadingFailed: view.t('core', 'dataTables:loadingFailed'),
          zeroRecords: view.t('core', 'dataTables:zeroRecords'),
          emptyTable: view.t('core', 'dataTables:emptyTable'),
          paginate: {
            first: view.t('core', 'dataTables:paginate:first'),
            previous: view.t('core', 'dataTables:paginate:previous'),
            next: view.t('core', 'dataTables:paginate:next'),
            last: view.t('core', 'dataTables:paginate:last')
          },
          aria: {
            sortAscending: view.t('core', 'dataTables:aria:sortAscending'),
            sortDescending: view.t('core', 'dataTables:aria:sortDescending')
          }
        },
        columns: COLUMN_LIST
      });
    },

    onWindowResize: function()
    {
      if (this.dt)
      {
        this.$('.dataTables_scrollBody').css({height: this.getScrollY() + 'px'});
      }
    }

  });
});
