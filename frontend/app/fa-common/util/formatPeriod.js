// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n'
], function(
  t
) {
  'use strict';

  return function formatPeriod(months)
  {
    if (!months)
    {
      return '';
    }

    var y = Math.floor(months / 12);
    var m = months % 12;
    var key = 'period:';

    if (y && m)
    {
      key += 'both';
    }
    else if (y)
    {
      key += 'y';
    }
    else if (m)
    {
      key += 'm';
    }

    return t('fa-common', key, {
      years: y,
      months: m
    });
  };
});
