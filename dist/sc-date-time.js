(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'angular'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('angular'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.angular);
    global.main = mod.exports;
  }
})(this, function (exports, _angular) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _angular2 = _interopRequireDefault(_angular);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var MODULE_NAME = 'scDateTime';

  exports.default = MODULE_NAME;


  _angular2.default.module(MODULE_NAME, []).value('scDateTimeConfig', {
    defaultTheme: 'material',
    autosave: false,
    defaultMode: 'date',
    defaultDate: undefined, // should be date object!!
    displayMode: undefined,
    defaultOrientation: false,
    displayTwentyfour: false,
    compact: false
  }).value('scDateTimeI18n', {
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month',
    incrementHours: 'Increment Hours',
    decrementHours: 'Decrement Hours',
    incrementMinutes: 'Increment Minutes',
    decrementMinutes: 'Decrement Minutes',
    switchAmPm: 'Switch AM/PM',
    now: 'Now',
    clear: 'Clear',
    cancel: 'Cancel',
    save: 'Save',
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    switchTo: 'Switch to',
    clock: 'Clock',
    calendar: 'Calendar'
  }).directive('timeDatePicker', ['$filter', '$sce', '$rootScope', '$parse', 'scDateTimeI18n', 'scDateTimeConfig', function ($filter, $sce, $rootScope, $parse, scDateTimeI18n, scDateTimeConfig) {
    var _dateFilter = $filter('date');
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        _weekdays: '=?tdWeekdays'
      },
      require: 'ngModel',
      templateUrl: function templateUrl(tElement, tAttrs) {
        if (tAttrs.theme == null || tAttrs.theme === '') {
          tAttrs.theme = scDateTimeConfig.defaultTheme;
        }

        return tAttrs.theme.indexOf('/') <= 0 ? 'scDateTime-' + tAttrs.theme + '.tpl' : tAttrs.theme;
      },
      link: function link(scope, element, attrs, ngModel) {
        attrs.$observe('defaultMode', function (val) {
          if (val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.defaultMode;
          }

          return scope._mode = val;
        });
        attrs.$observe('defaultDate', function (val) {
          return scope._defaultDate = val != null && Date.parse(val) ? Date.parse(val) : scDateTimeConfig.defaultDate;
        });
        attrs.$observe('displayMode', function (val) {
          if (val !== 'full' && val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.displayMode;
          }

          return scope._displayMode = val;
        });
        attrs.$observe('orientation', function (val) {
          return scope._verticalMode = val != null ? val === 'true' : scDateTimeConfig.defaultOrientation;
        });
        attrs.$observe('compact', function (val) {
          return scope._compact = val != null ? val === 'true' : scDateTimeConfig.compact;
        });
        attrs.$observe('displayTwentyfour', function (val) {
          return scope._hours24 = val != null ? val : scDateTimeConfig.displayTwentyfour;
        });
        attrs.$observe('mindate', function (val) {
          if (val != null && Date.parse(val)) {
            scope.restrictions.mindate = new Date(val);
            return scope.restrictions.mindate.setHours(0, 0, 0, 0);
          }
        });
        attrs.$observe('maxdate', function (val) {
          if (val != null && Date.parse(val)) {
            scope.restrictions.maxdate = new Date(val);
            return scope.restrictions.maxdate.setHours(23, 59, 59, 999);
          }
        });
        scope._weekdays = scope._weekdays || scDateTimeI18n.weekdays;
        scope.$watch('_weekdays', function (value) {
          if (value == null || !_angular2.default.isArray(value)) {
            return scope._weekdays = scDateTimeI18n.weekdays;
          }
        });

        ngModel.$render = function () {
          return scope.setDate(ngModel.$modelValue != null ? ngModel.$modelValue : scope._defaultDate, ngModel.$modelValue != null);
        };

        // Select contents of inputs when foccussed into
        _angular2.default.forEach(element.find('input'), function (input) {
          return _angular2.default.element(input).on('focus', function () {
            return setTimeout(function () {
              return input.select();
            }, 10);
          });
        });

        scope.autosave = false;
        if (attrs.autosave != null || scDateTimeConfig.autosave) {
          scope.saveUpdateDate = function () {
            return ngModel.$setViewValue(scope.date);
          };
          return scope.autosave = true;
        }

        var saveFn = $parse(attrs.onSave);
        var cancelFn = $parse(attrs.onCancel);
        scope.saveUpdateDate = function () {
          return true;
        };

        scope.save = function () {
          ngModel.$setViewValue(new Date(scope.date));
          return saveFn(scope.$parent, { $value: new Date(scope.date) });
        };

        scope.clear = function () {
          ngModel.$setViewValue(null);
          return saveFn(scope.$parent, { $value: null });
        };

        return scope.cancel = function () {
          cancelFn(scope.$parent, {});
          return ngModel.$render();
        };
      },


      controller: ['$scope', 'scDateTimeI18n', function (scope, scDateTimeI18n) {
        var i = void 0;
        scope._defaultDate = scDateTimeConfig.defaultDate;
        scope._mode = scDateTimeConfig.defaultMode;
        scope._displayMode = scDateTimeConfig.displayMode;
        scope._verticalMode = scDateTimeConfig.defaultOrientation;
        scope._hours24 = scDateTimeConfig.displayTwentyfour;
        scope._compact = scDateTimeConfig.compact;
        scope.translations = scDateTimeI18n;
        scope.restrictions = {
          mindate: undefined,
          maxdate: undefined
        };

        scope.addZero = function (min) {
          if (min > 9) {
            return min.toString();
          }return ('0' + min).slice(-2);
        };

        scope.setDate = function (newVal, save) {
          if (save == null) {
            save = true;
          }

          scope.date = newVal ? new Date(newVal) : new Date();
          scope.calendar._year = scope.date.getFullYear();
          scope.calendar._month = scope.date.getMonth();
          scope.clock._minutes = /* scope.addZero(*/scope.date.getMinutes() /* )*/;
          scope.clock._hours = scope._hours24 ? scope.date.getHours() : scope.date.getHours() % 12;
          if (!scope._hours24 && scope.clock._hours === 0) {
            scope.clock._hours = 12;
          }

          return scope.calendar.yearChange(save);
        };

        scope.display = {
          fullTitle: function fullTitle() {
            var _timeString = scope._hours24 ? 'HH:mm' : 'h:mm a';
            if (scope._displayMode === 'full' && !scope._verticalMode) {
              return _dateFilter(scope.date, 'EEEE d MMMM yyyy, ' + _timeString);
            } else if (scope._displayMode === 'time') {
              return _dateFilter(scope.date, _timeString);
            } else if (scope._displayMode === 'date') {
              return _dateFilter(scope.date, 'EEE d MMM yyyy');
            }return _dateFilter(scope.date, 'd MMM yyyy, ' + _timeString);
          },
          title: function title() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, scope._displayMode === 'date' ? 'EEEE' : 'EEEE ' + (scope._hours24 ? 'HH:mm' : 'h:mm a'));
            }return _dateFilter(scope.date, 'MMMM d yyyy');
          },
          super: function _super() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, 'MMM');
            }return '';
          },
          main: function main() {
            return $sce.trustAsHtml(scope._mode === 'date' ? _dateFilter(scope.date, 'd') : scope._hours24 ? _dateFilter(scope.date, 'HH:mm') : _dateFilter(scope.date, 'h:mm') + '<small>' + _dateFilter(scope.date, 'a') + '</small>');
          },
          sub: function sub() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, 'yyyy');
            }return _dateFilter(scope.date, 'HH:mm');
          }
        };

        scope.calendar = {
          _month: 0,
          _year: 0,
          _months: [],
          _allMonths: function () {
            var result = [];
            for (i = 0; i <= 11; i++) {
              result.push(_dateFilter(new Date(0, i), 'MMMM'));
            }

            return result;
          }(),
          offsetMargin: function offsetMargin() {
            return new Date(this._year, this._month).getDay() * 2.7 + 'rem';
          },
          isVisible: function isVisible(d) {
            return new Date(this._year, this._month, d).getMonth() === this._month;
          },
          isDisabled: function isDisabled(d) {
            var currentDate = new Date(this._year, this._month, d);
            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            return mindate != null && currentDate < mindate || maxdate != null && currentDate > maxdate;
          },
          isPrevMonthButtonHidden: function isPrevMonthButtonHidden() {
            var date = scope.restrictions.mindate;
            return date != null && this._month <= date.getMonth() && this._year <= date.getFullYear();
          },
          isNextMonthButtonHidden: function isNextMonthButtonHidden() {
            var date = scope.restrictions.maxdate;
            return date != null && this._month >= date.getMonth() && this._year >= date.getFullYear();
          },
          class: function _class(d) {
            var classString = '';
            if (scope.date != null && new Date(this._year, this._month, d).getTime() === new Date(scope.date.getTime()).setHours(0, 0, 0, 0)) {
              classString += 'selected';
            }

            if (new Date(this._year, this._month, d).getTime() === new Date().setHours(0, 0, 0, 0)) {
              classString += ' today';
            }

            return classString;
          },
          select: function select(d) {
            scope.date.setFullYear(this._year, this._month, d);
            return scope.saveUpdateDate();
          },
          monthChange: function monthChange(save) {
            if (save == null) {
              save = true;
            }

            if (this._year == null || isNaN(this._year)) {
              this._year = new Date().getFullYear();
            }

            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            if (mindate != null && mindate.getFullYear() === this._year && mindate.getMonth() >= this._month) {
              this._month = Math.max(mindate.getMonth(), this._month);
            }

            if (maxdate != null && maxdate.getFullYear() === this._year && maxdate.getMonth() <= this._month) {
              this._month = Math.min(maxdate.getMonth(), this._month);
            }

            scope.date.setFullYear(this._year, this._month);
            if (scope.date.getMonth() !== this._month) {
              scope.date.setDate(0);
            }

            if (mindate != null && scope.date < mindate) {
              scope.date.setDate(mindate.getTime());
              scope.calendar.select(mindate.getDate());
            }

            if (maxdate != null && scope.date > maxdate) {
              scope.date.setDate(maxdate.getTime());
              scope.calendar.select(maxdate.getDate());
            }

            if (save) {
              return scope.saveUpdateDate();
            }
          },
          _incMonth: function _incMonth(months) {
            this._month += months;
            while (this._month < 0 || this._month > 11) {
              if (this._month < 0) {
                this._month += 12;
                this._year--;
              } else {
                this._month -= 12;
                this._year++;
              }
            }

            return this.monthChange();
          },
          yearChange: function yearChange(save) {
            if (save == null) {
              save = true;
            }

            if (scope.calendar._year == null || scope.calendar._year === '') {
              return;
            }

            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            i = mindate != null && mindate.getFullYear() === scope.calendar._year ? mindate.getMonth() : 0;
            var len = maxdate != null && maxdate.getFullYear() === scope.calendar._year ? maxdate.getMonth() : 11;
            scope.calendar._months = scope.calendar._allMonths.slice(i, len + 1);
            return scope.calendar.monthChange(save);
          }
        };
        scope.clock = {
          _minutes: 0 /* '00'*/
          , _hours: 0,
          _incHours: function _incHours(inc) {
            this._hours = scope._hours24 ? Math.max(0, Math.min(23, this._hours + inc)) : Math.max(1, Math.min(12, this._hours + inc));
            if (isNaN(this._hours)) {
              return this._hours = 0;
            }
          },
          _incMinutes: function _incMinutes(inc) {
            return this._minutes = /* scope.addZero(*/Math.max(0, Math.min(59, parseInt(this._minutes) + inc)) /* ).toString()*/;
          },
          setAM: function setAM(b) {
            if (b == null) {
              b = !this.isAM();
            }

            if (b && !this.isAM()) {
              scope.date.setHours(scope.date.getHours() - 12);
            } else if (!b && this.isAM()) {
              scope.date.setHours(scope.date.getHours() + 12);
            }

            return scope.saveUpdateDate();
          },
          isAM: function isAM() {
            return scope.date.getHours() < 12;
          }
        };
        scope.$watch('clock._minutes', function (val, oldVal) {
          // if (!val) { return; }

          var intMin = parseInt(val);
          if (!isNaN(intMin) && intMin >= 0 && intMin <= 59 && intMin !== scope.date.getMinutes()) {
            scope.date.setMinutes(intMin);
            return scope.saveUpdateDate();
          }
        });
        scope.$watch('clock._hours', function (val) {
          if (val != null && !isNaN(val)) {
            if (!scope._hours24) {
              if (val === 24) {
                val = 12;
              } else if (val === 12) {
                val = 0;
              } else if (!scope.clock.isAM()) {
                val += 12;
              }
            }

            if (val !== scope.date.getHours()) {
              scope.date.setHours(val);
              return scope.saveUpdateDate();
            }
          }
        });

        scope.setNow = function () {
          scope.setDate();
          return scope.saveUpdateDate();
        };

        scope.modeClass = function () {
          if (scope._displayMode != null) {
            scope._mode = scope._displayMode;
          }

          return '' + (scope._verticalMode ? 'vertical ' : '') + (scope._displayMode === 'full' ? 'full-mode' : scope._displayMode === 'time' ? 'time-only' : scope._displayMode === 'date' ? 'date-only' : scope._mode === 'date' ? 'date-mode' : 'time-mode') + ' ' + (scope._compact ? 'compact' : '');
        };

        scope.modeSwitch = function () {
          return scope._mode = scope._displayMode != null ? scope._displayMode : scope._mode === 'date' ? 'time' : 'date';
        };
        return scope.modeSwitchText = function () {
          return scDateTimeI18n.switchTo + ' ' + (scope._mode === 'date' ? scDateTimeI18n.clock : scDateTimeI18n.calendar);
        };
      }]
    };
  }]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiTU9EVUxFX05BTUUiLCJtb2R1bGUiLCJ2YWx1ZSIsImRlZmF1bHRUaGVtZSIsImF1dG9zYXZlIiwiZGVmYXVsdE1vZGUiLCJkZWZhdWx0RGF0ZSIsInVuZGVmaW5lZCIsImRpc3BsYXlNb2RlIiwiZGVmYXVsdE9yaWVudGF0aW9uIiwiZGlzcGxheVR3ZW50eWZvdXIiLCJjb21wYWN0IiwicHJldmlvdXNNb250aCIsIm5leHRNb250aCIsImluY3JlbWVudEhvdXJzIiwiZGVjcmVtZW50SG91cnMiLCJpbmNyZW1lbnRNaW51dGVzIiwiZGVjcmVtZW50TWludXRlcyIsInN3aXRjaEFtUG0iLCJub3ciLCJjbGVhciIsImNhbmNlbCIsInNhdmUiLCJ3ZWVrZGF5cyIsInN3aXRjaFRvIiwiY2xvY2siLCJjYWxlbmRhciIsImRpcmVjdGl2ZSIsIiRmaWx0ZXIiLCIkc2NlIiwiJHJvb3RTY29wZSIsIiRwYXJzZSIsInNjRGF0ZVRpbWVJMThuIiwic2NEYXRlVGltZUNvbmZpZyIsIl9kYXRlRmlsdGVyIiwicmVzdHJpY3QiLCJyZXBsYWNlIiwic2NvcGUiLCJfd2Vla2RheXMiLCJyZXF1aXJlIiwidGVtcGxhdGVVcmwiLCJ0RWxlbWVudCIsInRBdHRycyIsInRoZW1lIiwiaW5kZXhPZiIsImxpbmsiLCJlbGVtZW50IiwiYXR0cnMiLCJuZ01vZGVsIiwiJG9ic2VydmUiLCJ2YWwiLCJfbW9kZSIsIl9kZWZhdWx0RGF0ZSIsIkRhdGUiLCJwYXJzZSIsIl9kaXNwbGF5TW9kZSIsIl92ZXJ0aWNhbE1vZGUiLCJfY29tcGFjdCIsIl9ob3VyczI0IiwicmVzdHJpY3Rpb25zIiwibWluZGF0ZSIsInNldEhvdXJzIiwibWF4ZGF0ZSIsIiR3YXRjaCIsImlzQXJyYXkiLCIkcmVuZGVyIiwic2V0RGF0ZSIsIiRtb2RlbFZhbHVlIiwiZm9yRWFjaCIsImZpbmQiLCJpbnB1dCIsIm9uIiwic2V0VGltZW91dCIsInNlbGVjdCIsInNhdmVVcGRhdGVEYXRlIiwiJHNldFZpZXdWYWx1ZSIsImRhdGUiLCJzYXZlRm4iLCJvblNhdmUiLCJjYW5jZWxGbiIsIm9uQ2FuY2VsIiwiJHBhcmVudCIsIiR2YWx1ZSIsImNvbnRyb2xsZXIiLCJpIiwidHJhbnNsYXRpb25zIiwiYWRkWmVybyIsIm1pbiIsInRvU3RyaW5nIiwic2xpY2UiLCJuZXdWYWwiLCJfeWVhciIsImdldEZ1bGxZZWFyIiwiX21vbnRoIiwiZ2V0TW9udGgiLCJfbWludXRlcyIsImdldE1pbnV0ZXMiLCJfaG91cnMiLCJnZXRIb3VycyIsInllYXJDaGFuZ2UiLCJkaXNwbGF5IiwiZnVsbFRpdGxlIiwiX3RpbWVTdHJpbmciLCJ0aXRsZSIsInN1cGVyIiwibWFpbiIsInRydXN0QXNIdG1sIiwic3ViIiwiX21vbnRocyIsIl9hbGxNb250aHMiLCJyZXN1bHQiLCJwdXNoIiwib2Zmc2V0TWFyZ2luIiwiZ2V0RGF5IiwiaXNWaXNpYmxlIiwiZCIsImlzRGlzYWJsZWQiLCJjdXJyZW50RGF0ZSIsImlzUHJldk1vbnRoQnV0dG9uSGlkZGVuIiwiaXNOZXh0TW9udGhCdXR0b25IaWRkZW4iLCJjbGFzcyIsImNsYXNzU3RyaW5nIiwiZ2V0VGltZSIsInNldEZ1bGxZZWFyIiwibW9udGhDaGFuZ2UiLCJpc05hTiIsIk1hdGgiLCJtYXgiLCJnZXREYXRlIiwiX2luY01vbnRoIiwibW9udGhzIiwibGVuIiwiX2luY0hvdXJzIiwiaW5jIiwiX2luY01pbnV0ZXMiLCJwYXJzZUludCIsInNldEFNIiwiYiIsImlzQU0iLCJvbGRWYWwiLCJpbnRNaW4iLCJzZXRNaW51dGVzIiwic2V0Tm93IiwibW9kZUNsYXNzIiwibW9kZVN3aXRjaCIsIm1vZGVTd2l0Y2hUZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxNQUFNQSxjQUFjLFlBQXBCOztvQkFFZUEsVzs7O0FBRWYsb0JBQVFDLE1BQVIsQ0FBZUQsV0FBZixFQUE0QixFQUE1QixFQUNDRSxLQURELENBQ08sa0JBRFAsRUFD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QU1vQixRQUFOLEdBQWlCLFNBQWpCLEdBQTZCLEVBTDVDO0FBTUQsU0FURDs7QUFXQXBCLGNBQU0yRyxVQUFOLEdBQW1CO0FBQUEsaUJBQU0zRyxNQUFNYyxLQUFOLEdBQWNkLE1BQU1rQixZQUFOLElBQXNCLElBQXRCLEdBQTZCbEIsTUFBTWtCLFlBQW5DLEdBQWtEbEIsTUFBTWMsS0FBTixLQUFnQixNQUFoQixHQUF5QixNQUF6QixHQUFrQyxNQUF4RztBQUFBLFNBQW5CO0FBQ0EsZUFBT2QsTUFBTTRHLGNBQU4sR0FBdUI7QUFBQSxpQkFBU2pILGVBQWVSLFFBQXhCLFVBQzlCYSxNQUFNYyxLQUFOLEtBQWdCLE1BQWhCLEdBQXlCbkIsZUFBZVAsS0FBeEMsR0FBZ0RPLGVBQWVOLFFBRGpDO0FBQUEsU0FBOUI7QUFFRCxPQWxRVztBQXBGUCxLQUFQO0FBeVZELEdBNVYyQixDQTVCOUIiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhbmd1bGFyIGZyb20gJ2FuZ3VsYXInO1xuXG5jb25zdCBNT0RVTEVfTkFNRSA9ICdzY0RhdGVUaW1lJztcblxuZXhwb3J0IGRlZmF1bHQgTU9EVUxFX05BTUU7XG5cbmFuZ3VsYXIubW9kdWxlKE1PRFVMRV9OQU1FLCBbXSlcbi52YWx1ZSgnc2NEYXRlVGltZUNvbmZpZycsIHtcbiAgZGVmYXVsdFRoZW1lOiAnbWF0ZXJpYWwnLFxuICBhdXRvc2F2ZTogZmFsc2UsXG4gIGRlZmF1bHRNb2RlOiAnZGF0ZScsXG4gIGRlZmF1bHREYXRlOiB1bmRlZmluZWQsIC8vIHNob3VsZCBiZSBkYXRlIG9iamVjdCEhXG4gIGRpc3BsYXlNb2RlOiB1bmRlZmluZWQsXG4gIGRlZmF1bHRPcmllbnRhdGlvbjogZmFsc2UsXG4gIGRpc3BsYXlUd2VudHlmb3VyOiBmYWxzZSxcbiAgY29tcGFjdDogZmFsc2UsXG59LFxuKS52YWx1ZSgnc2NEYXRlVGltZUkxOG4nLCB7XG4gIHByZXZpb3VzTW9udGg6ICdQcmV2aW91cyBNb250aCcsXG4gIG5leHRNb250aDogJ05leHQgTW9udGgnLFxuICBpbmNyZW1lbnRIb3VyczogJ0luY3JlbWVudCBIb3VycycsXG4gIGRlY3JlbWVudEhvdXJzOiAnRGVjcmVtZW50IEhvdXJzJyxcbiAgaW5jcmVtZW50TWludXRlczogJ0luY3JlbWVudCBNaW51dGVzJyxcbiAgZGVjcmVtZW50TWludXRlczogJ0RlY3JlbWVudCBNaW51dGVzJyxcbiAgc3dpdGNoQW1QbTogJ1N3aXRjaCBBTS9QTScsXG4gIG5vdzogJ05vdycsXG4gIGNsZWFyOiAnQ2xlYXInLFxuICBjYW5jZWw6ICdDYW5jZWwnLFxuICBzYXZlOiAnU2F2ZScsXG4gIHdlZWtkYXlzOiBbJ1MnLCAnTScsICdUJywgJ1cnLCAnVCcsICdGJywgJ1MnXSxcbiAgc3dpdGNoVG86ICdTd2l0Y2ggdG8nLFxuICBjbG9jazogJ0Nsb2NrJyxcbiAgY2FsZW5kYXI6ICdDYWxlbmRhcicsXG59LFxuKS5kaXJlY3RpdmUoJ3RpbWVEYXRlUGlja2VyJywgWyckZmlsdGVyJywgJyRzY2UnLCAnJHJvb3RTY29wZScsICckcGFyc2UnLCAnc2NEYXRlVGltZUkxOG4nLCAnc2NEYXRlVGltZUNvbmZpZycsXG4gIGZ1bmN0aW9uICgkZmlsdGVyLCAkc2NlLCAkcm9vdFNjb3BlLCAkcGFyc2UsIHNjRGF0ZVRpbWVJMThuLCBzY0RhdGVUaW1lQ29uZmlnKSB7XG4gICAgY29uc3QgX2RhdGVGaWx0ZXIgPSAkZmlsdGVyKCdkYXRlJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIF93ZWVrZGF5czogJz0/dGRXZWVrZGF5cycsXG4gICAgICB9LFxuICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgICAgdGVtcGxhdGVVcmwodEVsZW1lbnQsIHRBdHRycykge1xuICAgICAgICBpZiAoKHRBdHRycy50aGVtZSA9PSBudWxsKSB8fCAodEF0dHJzLnRoZW1lID09PSAnJykpIHsgdEF0dHJzLnRoZW1lID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0VGhlbWU7IH1cblxuICAgICAgICByZXR1cm4gdEF0dHJzLnRoZW1lLmluZGV4T2YoJy8nKSA8PSAwID8gYHNjRGF0ZVRpbWUtJHt0QXR0cnMudGhlbWV9LnRwbGAgOiB0QXR0cnMudGhlbWU7XG4gICAgICB9LFxuXG4gICAgICBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGVmYXVsdE1vZGUnLCB2YWwgPT4ge1xuICAgICAgICAgIGlmICgodmFsICE9PSAndGltZScpICYmICh2YWwgIT09ICdkYXRlJykpIHsgdmFsID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0TW9kZTsgfVxuXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLl9tb2RlID0gdmFsO1xuICAgICAgICB9KTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2RlZmF1bHREYXRlJywgdmFsID0+XG4gICAgICAgIHNjb3BlLl9kZWZhdWx0RGF0ZSA9ICh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpID8gRGF0ZS5wYXJzZSh2YWwpXG4gICAgICAgIDogc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0RGF0ZSxcbiAgICAgICk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkaXNwbGF5TW9kZScsIHZhbCA9PiB7XG4gICAgICAgICAgaWYgKCh2YWwgIT09ICdmdWxsJykgJiYgKHZhbCAhPT0gJ3RpbWUnKSAmJiAodmFsICE9PSAnZGF0ZScpKSB7IHZhbCA9IHNjRGF0ZVRpbWVDb25maWcuZGlzcGxheU1vZGU7IH1cblxuICAgICAgICAgIHJldHVybiBzY29wZS5fZGlzcGxheU1vZGUgPSB2YWw7XG4gICAgICAgIH0pO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnb3JpZW50YXRpb24nLCB2YWwgPT4gc2NvcGUuX3ZlcnRpY2FsTW9kZSA9ICh2YWwgIT0gbnVsbCkgPyB2YWwgPT09ICd0cnVlJyA6IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdE9yaWVudGF0aW9uKTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2NvbXBhY3QnLCB2YWwgPT4gc2NvcGUuX2NvbXBhY3QgPSAodmFsICE9IG51bGwpID8gdmFsID09PSAndHJ1ZScgOiBzY0RhdGVUaW1lQ29uZmlnLmNvbXBhY3QpO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzcGxheVR3ZW50eWZvdXInLCB2YWwgPT4gc2NvcGUuX2hvdXJzMjQgPSAodmFsICE9IG51bGwpID8gdmFsIDogc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5VHdlbnR5Zm91cik7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdtaW5kYXRlJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiBEYXRlLnBhcnNlKHZhbCkpIHtcbiAgICAgICAgICAgIHNjb3BlLnJlc3RyaWN0aW9ucy5taW5kYXRlID0gbmV3IERhdGUodmFsKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5yZXN0cmljdGlvbnMubWluZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbWF4ZGF0ZScsIHZhbCA9PiB7XG4gICAgICAgICAgaWYgKCh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpKSB7XG4gICAgICAgICAgICBzY29wZS5yZXN0cmljdGlvbnMubWF4ZGF0ZSA9IG5ldyBEYXRlKHZhbCk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUucmVzdHJpY3Rpb25zLm1heGRhdGUuc2V0SG91cnMoMjMsIDU5LCA1OSwgOTk5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzY29wZS5fd2Vla2RheXMgPSBzY29wZS5fd2Vla2RheXMgfHwgc2NEYXRlVGltZUkxOG4ud2Vla2RheXM7XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnX3dlZWtkYXlzJywgdmFsdWUgPT4ge1xuICAgICAgICAgIGlmICgodmFsdWUgPT0gbnVsbCkgfHwgIWFuZ3VsYXIuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5fd2Vla2RheXMgPSBzY0RhdGVUaW1lSTE4bi53ZWVrZGF5cztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5nTW9kZWwuJHJlbmRlciA9ICgpID0+IHNjb3BlLnNldERhdGUobmdNb2RlbC4kbW9kZWxWYWx1ZSAhPSBudWxsID8gbmdNb2RlbC4kbW9kZWxWYWx1ZSA6IHNjb3BlLl9kZWZhdWx0RGF0ZSwgKG5nTW9kZWwuJG1vZGVsVmFsdWUgIT0gbnVsbCkpO1xuXG4gICAgICAgIC8vIFNlbGVjdCBjb250ZW50cyBvZiBpbnB1dHMgd2hlbiBmb2NjdXNzZWQgaW50b1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZWxlbWVudC5maW5kKCdpbnB1dCcpLFxuICAgICAgICBpbnB1dCA9PlxuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChpbnB1dCkub24oJ2ZvY3VzJywgKCkgPT4gc2V0VGltZW91dCgoKCkgPT4gaW5wdXQuc2VsZWN0KCkpLCAxMCkpLFxuICAgICAgKTtcblxuICAgICAgICBzY29wZS5hdXRvc2F2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoKGF0dHJzLmF1dG9zYXZlICE9IG51bGwpIHx8IHNjRGF0ZVRpbWVDb25maWcuYXV0b3NhdmUpIHtcbiAgICAgICAgICBzY29wZS5zYXZlVXBkYXRlRGF0ZSA9ICgpID0+IG5nTW9kZWwuJHNldFZpZXdWYWx1ZShzY29wZS5kYXRlKTtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuYXV0b3NhdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2F2ZUZuID0gJHBhcnNlKGF0dHJzLm9uU2F2ZSk7XG4gICAgICAgIGNvbnN0IGNhbmNlbEZuID0gJHBhcnNlKGF0dHJzLm9uQ2FuY2VsKTtcbiAgICAgICAgc2NvcGUuc2F2ZVVwZGF0ZURhdGUgPSAoKSA9PiB0cnVlO1xuXG4gICAgICAgIHNjb3BlLnNhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKG5ldyBEYXRlKHNjb3BlLmRhdGUpKTtcbiAgICAgICAgICByZXR1cm4gc2F2ZUZuKHNjb3BlLiRwYXJlbnQsIHsgJHZhbHVlOiBuZXcgRGF0ZShzY29wZS5kYXRlKSB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUobnVsbCk7XG4gICAgICAgICAgcmV0dXJuIHNhdmVGbihzY29wZS4kcGFyZW50LCB7ICR2YWx1ZTogbnVsbCB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbmNlbEZuKHNjb3BlLiRwYXJlbnQsIHt9KTtcbiAgICAgICAgICByZXR1cm4gbmdNb2RlbC4kcmVuZGVyKCk7XG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICdzY0RhdGVUaW1lSTE4bicsIGZ1bmN0aW9uIChzY29wZSwgc2NEYXRlVGltZUkxOG4pIHtcbiAgICAgICAgbGV0IGk7XG4gICAgICAgIHNjb3BlLl9kZWZhdWx0RGF0ZSA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdERhdGU7XG4gICAgICAgIHNjb3BlLl9tb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0TW9kZTtcbiAgICAgICAgc2NvcGUuX2Rpc3BsYXlNb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5TW9kZTtcbiAgICAgICAgc2NvcGUuX3ZlcnRpY2FsTW9kZSA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdE9yaWVudGF0aW9uO1xuICAgICAgICBzY29wZS5faG91cnMyNCA9IHNjRGF0ZVRpbWVDb25maWcuZGlzcGxheVR3ZW50eWZvdXI7XG4gICAgICAgIHNjb3BlLl9jb21wYWN0ID0gc2NEYXRlVGltZUNvbmZpZy5jb21wYWN0O1xuICAgICAgICBzY29wZS50cmFuc2xhdGlvbnMgPSBzY0RhdGVUaW1lSTE4bjtcbiAgICAgICAgc2NvcGUucmVzdHJpY3Rpb25zID0ge1xuICAgICAgICAgIG1pbmRhdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICBtYXhkYXRlOiB1bmRlZmluZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuYWRkWmVybyA9IGZ1bmN0aW9uIChtaW4pIHtcbiAgICAgICAgICBpZiAobWluID4gOSkgeyByZXR1cm4gbWluLnRvU3RyaW5nKCk7IH0gcmV0dXJuIChgMCR7bWlufWApLnNsaWNlKC0yKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5zZXREYXRlID0gZnVuY3Rpb24gKG5ld1ZhbCwgc2F2ZSkge1xuICAgICAgICAgIGlmIChzYXZlID09IG51bGwpIHsgc2F2ZSA9IHRydWU7IH1cblxuICAgICAgICAgIHNjb3BlLmRhdGUgPSBuZXdWYWwgPyBuZXcgRGF0ZShuZXdWYWwpIDogbmV3IERhdGUoKTtcbiAgICAgICAgICBzY29wZS5jYWxlbmRhci5feWVhciA9IHNjb3BlLmRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICBzY29wZS5jYWxlbmRhci5fbW9udGggPSBzY29wZS5kYXRlLmdldE1vbnRoKCk7XG4gICAgICAgICAgc2NvcGUuY2xvY2suX21pbnV0ZXMgPSAvKiBzY29wZS5hZGRaZXJvKCovc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkvKiApKi87XG4gICAgICAgICAgc2NvcGUuY2xvY2suX2hvdXJzID0gc2NvcGUuX2hvdXJzMjQgPyBzY29wZS5kYXRlLmdldEhvdXJzKCkgOiBzY29wZS5kYXRlLmdldEhvdXJzKCkgJSAxMjtcbiAgICAgICAgICBpZiAoIXNjb3BlLl9ob3VyczI0ICYmIChzY29wZS5jbG9jay5faG91cnMgPT09IDApKSB7IHNjb3BlLmNsb2NrLl9ob3VycyA9IDEyOyB9XG5cbiAgICAgICAgICByZXR1cm4gc2NvcGUuY2FsZW5kYXIueWVhckNoYW5nZShzYXZlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5kaXNwbGF5ID0ge1xuICAgICAgICAgIGZ1bGxUaXRsZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IF90aW1lU3RyaW5nID0gc2NvcGUuX2hvdXJzMjQgPyAnSEg6bW0nIDogJ2g6bW0gYSc7XG4gICAgICAgICAgICBpZiAoKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2Z1bGwnKSAmJiAhc2NvcGUuX3ZlcnRpY2FsTW9kZSkge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgYEVFRUUgZCBNTU1NIHl5eXksICR7X3RpbWVTdHJpbmd9YCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ3RpbWUnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCBfdGltZVN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnRUVFIGQgTU1NIHl5eXknKTtcbiAgICAgICAgICAgIH0gcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsIGBkIE1NTSB5eXl5LCAke190aW1lU3RyaW5nfWApO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB0aXRsZSgpIHtcbiAgICAgICAgICAgIGlmIChzY29wZS5fbW9kZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAoc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZGF0ZScgPyAnRUVFRScgOiBgRUVFRSAke1xuICAgICAgICAgICAgICBzY29wZS5faG91cnMyNCA/ICdISDptbScgOiAnaDptbSBhJ1xuICAgICAgICAgICAgfWApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdNTU1NIGQgeXl5eScpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzdXBlcigpIHtcbiAgICAgICAgICAgIGlmIChzY29wZS5fbW9kZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnTU1NJyk7XG4gICAgICAgICAgICB9IHJldHVybiAnJztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbWFpbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKFxuICAgICAgICAgIHNjb3BlLl9tb2RlID09PSAnZGF0ZScgPyBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnZCcpXG4gICAgICAgICAgOlxuICAgICAgICAgICAgc2NvcGUuX2hvdXJzMjQgPyBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnSEg6bW0nKVxuICAgICAgICAgICAgOiBgJHtfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnaDptbScpfTxzbWFsbD4ke19kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdhJyl9PC9zbWFsbD5gLFxuICAgICAgICApO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzdWIoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuX21vZGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ3l5eXknKTtcbiAgICAgICAgICAgIH0gcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdISDptbScpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuY2FsZW5kYXIgPSB7XG4gICAgICAgICAgX21vbnRoOiAwLFxuICAgICAgICAgIF95ZWFyOiAwLFxuICAgICAgICAgIF9tb250aHM6IFtdLFxuICAgICAgICAgIF9hbGxNb250aHM6ICgoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDw9IDExOyBpKyspIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goX2RhdGVGaWx0ZXIobmV3IERhdGUoMCwgaSksICdNTU1NJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0pKCkpLFxuICAgICAgICAgIG9mZnNldE1hcmdpbigpIHsgcmV0dXJuIGAke25ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoKS5nZXREYXkoKSAqIDIuN31yZW1gOyB9LFxuXG4gICAgICAgICAgaXNWaXNpYmxlKGQpIHsgcmV0dXJuIG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKS5nZXRNb250aCgpID09PSB0aGlzLl9tb250aDsgfSxcblxuICAgICAgICAgIGlzRGlzYWJsZWQoZCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudERhdGUgPSBuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCk7XG4gICAgICAgICAgICBjb25zdCB7IG1pbmRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcbiAgICAgICAgICAgIGNvbnN0IHsgbWF4ZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgcmV0dXJuICgobWluZGF0ZSAhPSBudWxsKSAmJiAoY3VycmVudERhdGUgPCBtaW5kYXRlKSkgfHwgKChtYXhkYXRlICE9IG51bGwpICYmIChjdXJyZW50RGF0ZSA+IG1heGRhdGUpKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaXNQcmV2TW9udGhCdXR0b25IaWRkZW4oKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gc2NvcGUucmVzdHJpY3Rpb25zLm1pbmRhdGU7XG4gICAgICAgICAgICByZXR1cm4gKGRhdGUgIT0gbnVsbCkgJiYgKHRoaXMuX21vbnRoIDw9IGRhdGUuZ2V0TW9udGgoKSkgJiYgKHRoaXMuX3llYXIgPD0gZGF0ZS5nZXRGdWxsWWVhcigpKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaXNOZXh0TW9udGhCdXR0b25IaWRkZW4oKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gc2NvcGUucmVzdHJpY3Rpb25zLm1heGRhdGU7XG4gICAgICAgICAgICByZXR1cm4gKGRhdGUgIT0gbnVsbCkgJiYgKHRoaXMuX21vbnRoID49IGRhdGUuZ2V0TW9udGgoKSkgJiYgKHRoaXMuX3llYXIgPj0gZGF0ZS5nZXRGdWxsWWVhcigpKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgY2xhc3MoZCkge1xuICAgICAgICAgICAgbGV0IGNsYXNzU3RyaW5nID0gJyc7XG4gICAgICAgICAgICBpZiAoKHNjb3BlLmRhdGUgIT0gbnVsbCkgJiYgKG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKS5nZXRUaW1lKCkgPT09IG5ldyBEYXRlKHNjb3BlLmRhdGUuZ2V0VGltZSgpKS5zZXRIb3VycygwLFxuICAgICAgICAgICAgMCwgMCwgMCkpKSB7XG4gICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9ICdzZWxlY3RlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0VGltZSgpID09PSBuZXcgRGF0ZSgpLnNldEhvdXJzKDAsIDAsIDAsIDApKSB7XG4gICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9ICcgdG9kYXknO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY2xhc3NTdHJpbmc7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNlbGVjdChkKSB7XG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBtb250aENoYW5nZShzYXZlKSB7XG4gICAgICAgICAgICBpZiAoc2F2ZSA9PSBudWxsKSB7IHNhdmUgPSB0cnVlOyB9XG5cbiAgICAgICAgICAgIGlmICgodGhpcy5feWVhciA9PSBudWxsKSB8fCBpc05hTih0aGlzLl95ZWFyKSkgeyB0aGlzLl95ZWFyID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpOyB9XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbWluZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgY29uc3QgeyBtYXhkYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XG4gICAgICAgICAgICBpZiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKG1pbmRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gdGhpcy5feWVhcikgJiYgKG1pbmRhdGUuZ2V0TW9udGgoKSA+PSB0aGlzLl9tb250aCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5fbW9udGggPSBNYXRoLm1heChtaW5kYXRlLmdldE1vbnRoKCksIHRoaXMuX21vbnRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKChtYXhkYXRlICE9IG51bGwpICYmIChtYXhkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHRoaXMuX3llYXIpICYmIChtYXhkYXRlLmdldE1vbnRoKCkgPD0gdGhpcy5fbW9udGgpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21vbnRoID0gTWF0aC5taW4obWF4ZGF0ZS5nZXRNb250aCgpLCB0aGlzLl9tb250aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RnVsbFllYXIodGhpcy5feWVhciwgdGhpcy5fbW9udGgpO1xuICAgICAgICAgICAgaWYgKHNjb3BlLmRhdGUuZ2V0TW9udGgoKSAhPT0gdGhpcy5fbW9udGgpIHsgc2NvcGUuZGF0ZS5zZXREYXRlKDApOyB9XG5cbiAgICAgICAgICAgIGlmICgobWluZGF0ZSAhPSBudWxsKSAmJiAoc2NvcGUuZGF0ZSA8IG1pbmRhdGUpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RGF0ZShtaW5kYXRlLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLnNlbGVjdChtaW5kYXRlLmdldERhdGUoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAoc2NvcGUuZGF0ZSA+IG1heGRhdGUpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RGF0ZShtYXhkYXRlLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLnNlbGVjdChtYXhkYXRlLmdldERhdGUoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzYXZlKSB7IHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpOyB9XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9pbmNNb250aChtb250aHMpIHtcbiAgICAgICAgICAgIHRoaXMuX21vbnRoICs9IG1vbnRocztcbiAgICAgICAgICAgIHdoaWxlICgodGhpcy5fbW9udGggPCAwKSB8fCAodGhpcy5fbW9udGggPiAxMSkpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX21vbnRoIDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoICs9IDEyO1xuICAgICAgICAgICAgICAgIHRoaXMuX3llYXItLTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb250aCAtPSAxMjtcbiAgICAgICAgICAgICAgICB0aGlzLl95ZWFyKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9udGhDaGFuZ2UoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgeWVhckNoYW5nZShzYXZlKSB7XG4gICAgICAgICAgICBpZiAoc2F2ZSA9PSBudWxsKSB7IHNhdmUgPSB0cnVlOyB9XG5cbiAgICAgICAgICAgIGlmICgoc2NvcGUuY2FsZW5kYXIuX3llYXIgPT0gbnVsbCkgfHwgKHNjb3BlLmNhbGVuZGFyLl95ZWFyID09PSAnJykpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbWluZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgY29uc3QgeyBtYXhkYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XG4gICAgICAgICAgICBpID0gKG1pbmRhdGUgIT0gbnVsbCkgJiYgKG1pbmRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2NvcGUuY2FsZW5kYXIuX3llYXIpID8gbWluZGF0ZS5nZXRNb250aCgpIDogMDtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IChtYXhkYXRlICE9IG51bGwpICYmIChtYXhkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNjb3BlLmNhbGVuZGFyLl95ZWFyKSA/IG1heGRhdGUuZ2V0TW9udGgoKSA6IDExO1xuICAgICAgICAgICAgc2NvcGUuY2FsZW5kYXIuX21vbnRocyA9IHNjb3BlLmNhbGVuZGFyLl9hbGxNb250aHMuc2xpY2UoaSwgbGVuICsgMSk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuY2FsZW5kYXIubW9udGhDaGFuZ2Uoc2F2ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgc2NvcGUuY2xvY2sgPSB7XG4gICAgICAgICAgX21pbnV0ZXM6IDAvKiAnMDAnKi8sXG4gICAgICAgICAgX2hvdXJzOiAwLFxuICAgICAgICAgIF9pbmNIb3VycyhpbmMpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvdXJzID0gc2NvcGUuX2hvdXJzMjRcbiAgICAgICAgICA/IE1hdGgubWF4KDAsIE1hdGgubWluKDIzLCB0aGlzLl9ob3VycyArIGluYykpXG4gICAgICAgICAgOiBNYXRoLm1heCgxLCBNYXRoLm1pbigxMiwgdGhpcy5faG91cnMgKyBpbmMpKTtcbiAgICAgICAgICAgIGlmIChpc05hTih0aGlzLl9ob3VycykpIHsgcmV0dXJuIHRoaXMuX2hvdXJzID0gMDsgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfaW5jTWludXRlcyhpbmMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9taW51dGVzID0gLyogc2NvcGUuYWRkWmVybygqL01hdGgubWF4KDAsIE1hdGgubWluKDU5LCBwYXJzZUludCh0aGlzLl9taW51dGVzKSArIGluYykpLyogKS50b1N0cmluZygpKi87XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNldEFNKGIpIHtcbiAgICAgICAgICAgIGlmIChiID09IG51bGwpIHsgYiA9ICF0aGlzLmlzQU0oKTsgfVxuXG4gICAgICAgICAgICBpZiAoYiAmJiAhdGhpcy5pc0FNKCkpIHtcbiAgICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRIb3VycyhzY29wZS5kYXRlLmdldEhvdXJzKCkgLSAxMik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFiICYmIHRoaXMuaXNBTSgpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0SG91cnMoc2NvcGUuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaXNBTSgpIHsgcmV0dXJuIHNjb3BlLmRhdGUuZ2V0SG91cnMoKSA8IDEyOyB9LFxuICAgICAgICB9O1xuICAgICAgICBzY29wZS4kd2F0Y2goJ2Nsb2NrLl9taW51dGVzJywgKHZhbCwgb2xkVmFsKSA9PiB7XG4gICAgICAgICAgLy8gaWYgKCF2YWwpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICBjb25zdCBpbnRNaW4gPSBwYXJzZUludCh2YWwpO1xuICAgICAgICAgIGlmICghaXNOYU4oaW50TWluKSAmJiBpbnRNaW4gPj0gMCAmJiBpbnRNaW4gPD0gNTkgJiYgKGludE1pbiAhPT0gc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkpKSB7XG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldE1pbnV0ZXMoaW50TWluKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnY2xvY2suX2hvdXJzJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiAhaXNOYU4odmFsKSkge1xuICAgICAgICAgICAgaWYgKCFzY29wZS5faG91cnMyNCkge1xuICAgICAgICAgICAgICBpZiAodmFsID09PSAyNCkge1xuICAgICAgICAgICAgICAgIHZhbCA9IDEyO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gMTIpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzY29wZS5jbG9jay5pc0FNKCkpIHsgdmFsICs9IDEyOyB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2YWwgIT09IHNjb3BlLmRhdGUuZ2V0SG91cnMoKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldEhvdXJzKHZhbCk7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NvcGUuc2V0Tm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNjb3BlLnNldERhdGUoKTtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5tb2RlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLl9kaXNwbGF5TW9kZSAhPSBudWxsKSB7IHNjb3BlLl9tb2RlID0gc2NvcGUuX2Rpc3BsYXlNb2RlOyB9XG5cbiAgICAgICAgICByZXR1cm4gYCR7c2NvcGUuX3ZlcnRpY2FsTW9kZSA/ICd2ZXJ0aWNhbCAnIDogJyd9JHtcbiAgICAgICAgc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZnVsbCcgPyAnZnVsbC1tb2RlJ1xuICAgICAgICA6IHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ3RpbWUnID8gJ3RpbWUtb25seSdcbiAgICAgICAgOiBzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW9ubHknXG4gICAgICAgIDogc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW1vZGUnXG4gICAgICAgIDogJ3RpbWUtbW9kZSd9ICR7c2NvcGUuX2NvbXBhY3QgPyAnY29tcGFjdCcgOiAnJ31gO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLm1vZGVTd2l0Y2ggPSAoKSA9PiBzY29wZS5fbW9kZSA9IHNjb3BlLl9kaXNwbGF5TW9kZSAhPSBudWxsID8gc2NvcGUuX2Rpc3BsYXlNb2RlIDogc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/ICd0aW1lJyA6ICdkYXRlJztcbiAgICAgICAgcmV0dXJuIHNjb3BlLm1vZGVTd2l0Y2hUZXh0ID0gKCkgPT4gYCR7c2NEYXRlVGltZUkxOG4uc3dpdGNoVG99ICR7XG4gICAgICAgIHNjb3BlLl9tb2RlID09PSAnZGF0ZScgPyBzY0RhdGVUaW1lSTE4bi5jbG9jayA6IHNjRGF0ZVRpbWVJMThuLmNhbGVuZGFyfWA7XG4gICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9LFxuXSk7XG4iXX0=
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-bootstrap.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><button type="button" ng-click="calendar._incMonth(-1)" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-left"></i></button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"> <button type="button" ng-click="calendar._incMonth(1)" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-right"></i></button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" class="btn btn-link day-cell">1</button> <button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" class="btn btn-link day-cell">2</button> <button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" class="btn btn-link day-cell">3</button> <button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" class="btn btn-link day-cell">4</button> <button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" class="btn btn-link day-cell">5</button> <button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" class="btn btn-link day-cell">6</button> <button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" class="btn btn-link day-cell">7</button> <button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" class="btn btn-link day-cell">8</button> <button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" class="btn btn-link day-cell">9</button> <button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" class="btn btn-link day-cell">10</button> <button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" class="btn btn-link day-cell">11</button> <button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" class="btn btn-link day-cell">12</button> <button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" class="btn btn-link day-cell">13</button> <button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" class="btn btn-link day-cell">14</button> <button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" class="btn btn-link day-cell">15</button> <button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" class="btn btn-link day-cell">16</button> <button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" class="btn btn-link day-cell">17</button> <button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" class="btn btn-link day-cell">18</button> <button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" class="btn btn-link day-cell">19</button> <button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" class="btn btn-link day-cell">20</button> <button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" class="btn btn-link day-cell">21</button> <button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" class="btn btn-link day-cell">22</button> <button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" class="btn btn-link day-cell">23</button> <button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" class="btn btn-link day-cell">24</button> <button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" class="btn btn-link day-cell">25</button> <button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" class="btn btn-link day-cell">26</button> <button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" class="btn btn-link day-cell">27</button> <button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" class="btn btn-link day-cell">28</button> <button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" class="btn btn-link day-cell">29</button> <button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" class="btn btn-link day-cell">30</button> <button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" class="btn btn-link day-cell">31</button></div></div><button type="button" ng-click="modeSwitch()" class="btn btn-link switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"> <button type="button" ng-click="clock._incHours(1)" class="btn btn-link hours up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incHours(-1)" class="btn btn-link hours down"><i class="fa fa-caret-down"></i></button> <input type="text" ng-model="clock._minutes"> <button type="button" ng-click="clock._incMinutes(1)" class="btn btn-link minutes up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incMinutes(-1)" class="btn btn-link minutes down"><i class="fa fa-caret-down"></i></button></div><div ng-if="!_hours24" class="buttons"><button type="button" ng-click="clock.setAM()" class="btn btn-link">{{date | date:\'a\'}}</button></div></div></div></div><div class="buttons"><button type="button" ng-click="setNow()" class="btn btn-link">{{:: translations.now}}</button> <button type="button" ng-click="cancel()" ng-if="!autosave" class="btn btn-link">{{:: translations.cancel}}</button> <button type="button" ng-click="save()" ng-if="!autosave" class="btn btn-link">{{:: translations.save}}</button></div></div>');

}]);
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-material.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><md-button type="button" ng-click="calendar._incMonth(-1)" aria-label="{{:: translations.previousMonth}}" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}"><!--i.fa.fa-caret-left--><md-icon>keyboard_arrow_left</md-icon></md-button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"><md-button type="button" ng-click="calendar._incMonth(1)" aria-label="{{:: translations.nextMonth}}" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}"><!--i.fa.fa-caret-right--><md-icon>keyboard_arrow_right</md-icon></md-button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><md-button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" aria-label="1" class="day-cell">1</md-button><md-button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" aria-label="2" class="day-cell">2</md-button><md-button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" aria-label="3" class="day-cell">3</md-button><md-button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" aria-label="4" class="day-cell">4</md-button><md-button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" aria-label="5" class="day-cell">5</md-button><md-button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" aria-label="6" class="day-cell">6</md-button><md-button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" aria-label="7" class="day-cell">7</md-button><md-button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" aria-label="8" class="day-cell">8</md-button><md-button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" aria-label="9" class="day-cell">9</md-button><md-button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" aria-label="10" class="day-cell">10</md-button><md-button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" aria-label="11" class="day-cell">11</md-button><md-button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" aria-label="12" class="day-cell">12</md-button><md-button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" aria-label="13" class="day-cell">13</md-button><md-button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" aria-label="14" class="day-cell">14</md-button><md-button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" aria-label="15" class="day-cell">15</md-button><md-button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" aria-label="16" class="day-cell">16</md-button><md-button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" aria-label="17" class="day-cell">17</md-button><md-button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" aria-label="18" class="day-cell">18</md-button><md-button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" aria-label="19" class="day-cell">19</md-button><md-button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" aria-label="20" class="day-cell">20</md-button><md-button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" aria-label="21" class="day-cell">21</md-button><md-button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" aria-label="22" class="day-cell">22</md-button><md-button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" aria-label="23" class="day-cell">23</md-button><md-button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" aria-label="24" class="day-cell">24</md-button><md-button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" aria-label="25" class="day-cell">25</md-button><md-button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" aria-label="26" class="day-cell">26</md-button><md-button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" aria-label="27" class="day-cell">27</md-button><md-button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" aria-label="28" class="day-cell">28</md-button><md-button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" aria-label="29" class="day-cell">29</md-button><md-button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" aria-label="30" class="day-cell">30</md-button><md-button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" aria-label="31" class="day-cell">31</md-button></div></div><md-button type="button" ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="switch-control"><!--i.fa.fa-clock-o--><md-icon>access_time</md-icon><!--i.fa.fa-calendar--><md-icon>today</md-icon><span class="visuallyhidden">{{modeSwitchText()}}</span></md-button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"><md-button type="button" ng-click="clock._incHours(1)" aria-label="{{:: translations.incrementHours}}" class="hours up"><!--i.fa.fa-caret-up--><md-icon>arrow_drop_up</md-icon></md-button><md-button type="button" ng-click="clock._incHours(-1)" aria-label="{{:: translations.decrementHours}}" class="hours down"><!--i.fa.fa-caret-down--><md-icon>arrow_drop_down</md-icon></md-button><input type="number" min="0" max="59" ng-model="clock._minutes"><md-button type="button" ng-click="clock._incMinutes(1)" aria-label="{{:: translations.incrementMinutes}}" class="minutes up"><!--i.fa.fa-caret-up--><md-icon>arrow_drop_up</md-icon></md-button><md-button type="button" ng-click="clock._incMinutes(-1)" aria-label="{{:: translations.decrementMinutes}}" class="minutes down"><!--i.fa.fa-caret-down--><md-icon>arrow_drop_down</md-icon></md-button></div><div ng-if="!_hours24" class="buttons"><md-button type="button" ng-click="clock.setAM()" aria-label="{{:: translations.switchAmPm}}">{{date | date:\'a\'}}</md-button></div></div></div></div><div class="buttons"><md-button type="button" ng-click="setNow()" aria-label="{{:: translations.now}}">{{:: translations.now}}</md-button><md-button type="button" ng-click="clear()" aria-label="{{:: translations.clear}}">{{:: translations.clear}}</md-button><md-button type="button" ng-click="cancel()" ng-if="!autosave" aria-label="{{:: translations.cancel}}">{{:: translations.cancel}}</md-button><md-button type="button" ng-click="save()" ng-if="!autosave" aria-label="{{:: translations.save}}">{{:: translations.save}}</md-button></div></div>');

}]);