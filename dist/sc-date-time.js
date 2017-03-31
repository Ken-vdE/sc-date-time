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
          scope.clock._minutes = /*scope.addZero(*/scope.date.getMinutes() /*)*/;
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
          _minutes: 0 /*'00'*/
          , _hours: 0,
          _incHours: function _incHours(inc) {
            this._hours = scope._hours24 ? Math.max(0, Math.min(23, this._hours + inc)) : Math.max(1, Math.min(12, this._hours + inc));
            if (isNaN(this._hours)) {
              return this._hours = 0;
            }
          },
          _incMinutes: function _incMinutes(inc) {
            return this._minutes = /*scope.addZero(*/Math.max(0, Math.min(59, parseInt(this._minutes) + inc)) /*).toString()*/;
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
          if (!val) {
            return;
          }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiTU9EVUxFX05BTUUiLCJtb2R1bGUiLCJ2YWx1ZSIsImRlZmF1bHRUaGVtZSIsImF1dG9zYXZlIiwiZGVmYXVsdE1vZGUiLCJkZWZhdWx0RGF0ZSIsInVuZGVmaW5lZCIsImRpc3BsYXlNb2RlIiwiZGVmYXVsdE9yaWVudGF0aW9uIiwiZGlzcGxheVR3ZW50eWZvdXIiLCJjb21wYWN0IiwicHJldmlvdXNNb250aCIsIm5leHRNb250aCIsImluY3JlbWVudEhvdXJzIiwiZGVjcmVtZW50SG91cnMiLCJpbmNyZW1lbnRNaW51dGVzIiwiZGVjcmVtZW50TWludXRlcyIsInN3aXRjaEFtUG0iLCJub3ciLCJjbGVhciIsImNhbmNlbCIsInNhdmUiLCJ3ZWVrZGF5cyIsInN3aXRjaFRvIiwiY2xvY2siLCJjYWxlbmRhciIsImRpcmVjdGl2ZSIsIiRmaWx0ZXIiLCIkc2NlIiwiJHJvb3RTY29wZSIsIiRwYXJzZSIsInNjRGF0ZVRpbWVJMThuIiwic2NEYXRlVGltZUNvbmZpZyIsIl9kYXRlRmlsdGVyIiwicmVzdHJpY3QiLCJyZXBsYWNlIiwic2NvcGUiLCJfd2Vla2RheXMiLCJyZXF1aXJlIiwidGVtcGxhdGVVcmwiLCJ0RWxlbWVudCIsInRBdHRycyIsInRoZW1lIiwiaW5kZXhPZiIsImxpbmsiLCJlbGVtZW50IiwiYXR0cnMiLCJuZ01vZGVsIiwiJG9ic2VydmUiLCJ2YWwiLCJfbW9kZSIsIl9kZWZhdWx0RGF0ZSIsIkRhdGUiLCJwYXJzZSIsIl9kaXNwbGF5TW9kZSIsIl92ZXJ0aWNhbE1vZGUiLCJfY29tcGFjdCIsIl9ob3VyczI0IiwicmVzdHJpY3Rpb25zIiwibWluZGF0ZSIsInNldEhvdXJzIiwibWF4ZGF0ZSIsIiR3YXRjaCIsImlzQXJyYXkiLCIkcmVuZGVyIiwic2V0RGF0ZSIsIiRtb2RlbFZhbHVlIiwiZm9yRWFjaCIsImZpbmQiLCJpbnB1dCIsIm9uIiwic2V0VGltZW91dCIsInNlbGVjdCIsInNhdmVVcGRhdGVEYXRlIiwiJHNldFZpZXdWYWx1ZSIsImRhdGUiLCJzYXZlRm4iLCJvblNhdmUiLCJjYW5jZWxGbiIsIm9uQ2FuY2VsIiwiJHBhcmVudCIsIiR2YWx1ZSIsImNvbnRyb2xsZXIiLCJpIiwidHJhbnNsYXRpb25zIiwiYWRkWmVybyIsIm1pbiIsInRvU3RyaW5nIiwic2xpY2UiLCJuZXdWYWwiLCJfeWVhciIsImdldEZ1bGxZZWFyIiwiX21vbnRoIiwiZ2V0TW9udGgiLCJfbWludXRlcyIsImdldE1pbnV0ZXMiLCJfaG91cnMiLCJnZXRIb3VycyIsInllYXJDaGFuZ2UiLCJkaXNwbGF5IiwiZnVsbFRpdGxlIiwiX3RpbWVTdHJpbmciLCJ0aXRsZSIsInN1cGVyIiwibWFpbiIsInRydXN0QXNIdG1sIiwic3ViIiwiX21vbnRocyIsIl9hbGxNb250aHMiLCJyZXN1bHQiLCJwdXNoIiwib2Zmc2V0TWFyZ2luIiwiZ2V0RGF5IiwiaXNWaXNpYmxlIiwiZCIsImlzRGlzYWJsZWQiLCJjdXJyZW50RGF0ZSIsImlzUHJldk1vbnRoQnV0dG9uSGlkZGVuIiwiaXNOZXh0TW9udGhCdXR0b25IaWRkZW4iLCJjbGFzcyIsImNsYXNzU3RyaW5nIiwiZ2V0VGltZSIsInNldEZ1bGxZZWFyIiwibW9udGhDaGFuZ2UiLCJpc05hTiIsIk1hdGgiLCJtYXgiLCJnZXREYXRlIiwiX2luY01vbnRoIiwibW9udGhzIiwibGVuIiwiX2luY0hvdXJzIiwiaW5jIiwiX2luY01pbnV0ZXMiLCJwYXJzZUludCIsInNldEFNIiwiYiIsImlzQU0iLCJvbGRWYWwiLCJpbnRNaW4iLCJzZXRNaW51dGVzIiwic2V0Tm93IiwibW9kZUNsYXNzIiwibW9kZVN3aXRjaCIsIm1vZGVTd2l0Y2hUZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxNQUFNQSxjQUFjLFlBQXBCOztvQkFFZUEsVzs7O0FBRWYsb0JBQVFDLE1BQVIsQ0FBZUQsV0FBZixFQUE0QixFQUE1QixFQUNDRSxLQURELENBQ08sa0JBRFAsRUFD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QWhCLEdBQXlCLFdBQXpCLEdBQ0EsV0FMQSxXQUtlZCxNQUFNb0IsUUFBTixHQUFpQixTQUFqQixHQUE2QixFQUw1QztBQU1ELFNBVEQ7O0FBV0FwQixjQUFNMkcsVUFBTixHQUFtQjtBQUFBLGlCQUFNM0csTUFBTWMsS0FBTixHQUFjZCxNQUFNa0IsWUFBTixJQUFzQixJQUF0QixHQUE2QmxCLE1BQU1rQixZQUFuQyxHQUFrRGxCLE1BQU1jLEtBQU4sS0FBZ0IsTUFBaEIsR0FBeUIsTUFBekIsR0FBa0MsTUFBeEc7QUFBQSxTQUFuQjtBQUNBLGVBQU9kLE1BQU00RyxjQUFOLEdBQXVCO0FBQUEsaUJBQVNqSCxlQUFlUixRQUF4QixVQUM5QmEsTUFBTWMsS0FBTixLQUFnQixNQUFoQixHQUF5Qm5CLGVBQWVQLEtBQXhDLEdBQWdETyxlQUFlTixRQURqQztBQUFBLFNBQTlCO0FBRUQsT0FsUVc7QUFwRlAsS0FBUDtBQXlWRCxHQTVWMkIsQ0E1QjlCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcclxuXHJcbmNvbnN0IE1PRFVMRV9OQU1FID0gJ3NjRGF0ZVRpbWUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTU9EVUxFX05BTUU7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShNT0RVTEVfTkFNRSwgW10pXHJcbi52YWx1ZSgnc2NEYXRlVGltZUNvbmZpZycsIHtcclxuICBkZWZhdWx0VGhlbWU6ICdtYXRlcmlhbCcsXHJcbiAgYXV0b3NhdmU6IGZhbHNlLFxyXG4gIGRlZmF1bHRNb2RlOiAnZGF0ZScsXHJcbiAgZGVmYXVsdERhdGU6IHVuZGVmaW5lZCwgLy8gc2hvdWxkIGJlIGRhdGUgb2JqZWN0ISFcclxuICBkaXNwbGF5TW9kZTogdW5kZWZpbmVkLFxyXG4gIGRlZmF1bHRPcmllbnRhdGlvbjogZmFsc2UsXHJcbiAgZGlzcGxheVR3ZW50eWZvdXI6IGZhbHNlLFxyXG4gIGNvbXBhY3Q6IGZhbHNlLFxyXG59LFxyXG4pLnZhbHVlKCdzY0RhdGVUaW1lSTE4bicsIHtcclxuICBwcmV2aW91c01vbnRoOiAnUHJldmlvdXMgTW9udGgnLFxyXG4gIG5leHRNb250aDogJ05leHQgTW9udGgnLFxyXG4gIGluY3JlbWVudEhvdXJzOiAnSW5jcmVtZW50IEhvdXJzJyxcclxuICBkZWNyZW1lbnRIb3VyczogJ0RlY3JlbWVudCBIb3VycycsXHJcbiAgaW5jcmVtZW50TWludXRlczogJ0luY3JlbWVudCBNaW51dGVzJyxcclxuICBkZWNyZW1lbnRNaW51dGVzOiAnRGVjcmVtZW50IE1pbnV0ZXMnLFxyXG4gIHN3aXRjaEFtUG06ICdTd2l0Y2ggQU0vUE0nLFxyXG4gIG5vdzogJ05vdycsXHJcbiAgY2xlYXI6ICdDbGVhcicsXHJcbiAgY2FuY2VsOiAnQ2FuY2VsJyxcclxuICBzYXZlOiAnU2F2ZScsXHJcbiAgd2Vla2RheXM6IFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLFxyXG4gIHN3aXRjaFRvOiAnU3dpdGNoIHRvJyxcclxuICBjbG9jazogJ0Nsb2NrJyxcclxuICBjYWxlbmRhcjogJ0NhbGVuZGFyJyxcclxufSxcclxuKS5kaXJlY3RpdmUoJ3RpbWVEYXRlUGlja2VyJywgWyckZmlsdGVyJywgJyRzY2UnLCAnJHJvb3RTY29wZScsICckcGFyc2UnLCAnc2NEYXRlVGltZUkxOG4nLCAnc2NEYXRlVGltZUNvbmZpZycsXHJcbiAgZnVuY3Rpb24gKCRmaWx0ZXIsICRzY2UsICRyb290U2NvcGUsICRwYXJzZSwgc2NEYXRlVGltZUkxOG4sIHNjRGF0ZVRpbWVDb25maWcpIHtcclxuICAgIGNvbnN0IF9kYXRlRmlsdGVyID0gJGZpbHRlcignZGF0ZScpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdBRScsXHJcbiAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgX3dlZWtkYXlzOiAnPT90ZFdlZWtkYXlzJyxcclxuICAgICAgfSxcclxuICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgICB0ZW1wbGF0ZVVybCh0RWxlbWVudCwgdEF0dHJzKSB7XHJcbiAgICAgICAgaWYgKCh0QXR0cnMudGhlbWUgPT0gbnVsbCkgfHwgKHRBdHRycy50aGVtZSA9PT0gJycpKSB7IHRBdHRycy50aGVtZSA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdFRoZW1lOyB9XHJcblxyXG4gICAgICAgIHJldHVybiB0QXR0cnMudGhlbWUuaW5kZXhPZignLycpIDw9IDAgPyBgc2NEYXRlVGltZS0ke3RBdHRycy50aGVtZX0udHBsYCA6IHRBdHRycy50aGVtZTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKSB7XHJcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2RlZmF1bHRNb2RlJywgdmFsID0+IHtcclxuICAgICAgICAgIGlmICgodmFsICE9PSAndGltZScpICYmICh2YWwgIT09ICdkYXRlJykpIHsgdmFsID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0TW9kZTsgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBzY29wZS5fbW9kZSA9IHZhbDtcclxuICAgICAgICB9KTtcclxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGVmYXVsdERhdGUnLCB2YWwgPT5cclxuICAgICAgICBzY29wZS5fZGVmYXVsdERhdGUgPSAodmFsICE9IG51bGwpICYmIERhdGUucGFyc2UodmFsKSA/IERhdGUucGFyc2UodmFsKVxyXG4gICAgICAgIDogc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0RGF0ZSxcclxuICAgICAgKTtcclxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzcGxheU1vZGUnLCB2YWwgPT4ge1xyXG4gICAgICAgICAgaWYgKCh2YWwgIT09ICdmdWxsJykgJiYgKHZhbCAhPT0gJ3RpbWUnKSAmJiAodmFsICE9PSAnZGF0ZScpKSB7IHZhbCA9IHNjRGF0ZVRpbWVDb25maWcuZGlzcGxheU1vZGU7IH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gc2NvcGUuX2Rpc3BsYXlNb2RlID0gdmFsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdvcmllbnRhdGlvbicsIHZhbCA9PiBzY29wZS5fdmVydGljYWxNb2RlID0gKHZhbCAhPSBudWxsKSA/IHZhbCA9PT0gJ3RydWUnIDogc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0T3JpZW50YXRpb24pO1xyXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdjb21wYWN0JywgdmFsID0+IHNjb3BlLl9jb21wYWN0ID0gKHZhbCAhPSBudWxsKSA/IHZhbCA9PT0gJ3RydWUnIDogc2NEYXRlVGltZUNvbmZpZy5jb21wYWN0KTtcclxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzcGxheVR3ZW50eWZvdXInLCB2YWwgPT4gc2NvcGUuX2hvdXJzMjQgPSAodmFsICE9IG51bGwpID8gdmFsIDogc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5VHdlbnR5Zm91cik7XHJcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ21pbmRhdGUnLCB2YWwgPT4ge1xyXG4gICAgICAgICAgaWYgKCh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnJlc3RyaWN0aW9ucy5taW5kYXRlID0gbmV3IERhdGUodmFsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnJlc3RyaWN0aW9ucy5taW5kYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdtYXhkYXRlJywgdmFsID0+IHtcclxuICAgICAgICAgIGlmICgodmFsICE9IG51bGwpICYmIERhdGUucGFyc2UodmFsKSkge1xyXG4gICAgICAgICAgICBzY29wZS5yZXN0cmljdGlvbnMubWF4ZGF0ZSA9IG5ldyBEYXRlKHZhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5yZXN0cmljdGlvbnMubWF4ZGF0ZS5zZXRIb3VycygyMywgNTksIDU5LCA5OTkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNjb3BlLl93ZWVrZGF5cyA9IHNjb3BlLl93ZWVrZGF5cyB8fCBzY0RhdGVUaW1lSTE4bi53ZWVrZGF5cztcclxuICAgICAgICBzY29wZS4kd2F0Y2goJ193ZWVrZGF5cycsIHZhbHVlID0+IHtcclxuICAgICAgICAgIGlmICgodmFsdWUgPT0gbnVsbCkgfHwgIWFuZ3VsYXIuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLl93ZWVrZGF5cyA9IHNjRGF0ZVRpbWVJMThuLndlZWtkYXlzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZ01vZGVsLiRyZW5kZXIgPSAoKSA9PiBzY29wZS5zZXREYXRlKG5nTW9kZWwuJG1vZGVsVmFsdWUgIT0gbnVsbCA/IG5nTW9kZWwuJG1vZGVsVmFsdWUgOiBzY29wZS5fZGVmYXVsdERhdGUsIChuZ01vZGVsLiRtb2RlbFZhbHVlICE9IG51bGwpKTtcclxuXHJcbiAgICAgICAgLy8gU2VsZWN0IGNvbnRlbnRzIG9mIGlucHV0cyB3aGVuIGZvY2N1c3NlZCBpbnRvXHJcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGVsZW1lbnQuZmluZCgnaW5wdXQnKSxcclxuICAgICAgICBpbnB1dCA9PlxyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KGlucHV0KS5vbignZm9jdXMnLCAoKSA9PiBzZXRUaW1lb3V0KCgoKSA9PiBpbnB1dC5zZWxlY3QoKSksIDEwKSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAgIHNjb3BlLmF1dG9zYXZlID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKChhdHRycy5hdXRvc2F2ZSAhPSBudWxsKSB8fCBzY0RhdGVUaW1lQ29uZmlnLmF1dG9zYXZlKSB7XHJcbiAgICAgICAgICBzY29wZS5zYXZlVXBkYXRlRGF0ZSA9ICgpID0+IG5nTW9kZWwuJHNldFZpZXdWYWx1ZShzY29wZS5kYXRlKTtcclxuICAgICAgICAgIHJldHVybiBzY29wZS5hdXRvc2F2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzYXZlRm4gPSAkcGFyc2UoYXR0cnMub25TYXZlKTtcclxuICAgICAgICBjb25zdCBjYW5jZWxGbiA9ICRwYXJzZShhdHRycy5vbkNhbmNlbCk7XHJcbiAgICAgICAgc2NvcGUuc2F2ZVVwZGF0ZURhdGUgPSAoKSA9PiB0cnVlO1xyXG5cclxuICAgICAgICBzY29wZS5zYXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKG5ldyBEYXRlKHNjb3BlLmRhdGUpKTtcclxuICAgICAgICAgIHJldHVybiBzYXZlRm4oc2NvcGUuJHBhcmVudCwgeyAkdmFsdWU6IG5ldyBEYXRlKHNjb3BlLmRhdGUpIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNjb3BlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgcmV0dXJuIHNhdmVGbihzY29wZS4kcGFyZW50LCB7ICR2YWx1ZTogbnVsbCB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgY2FuY2VsRm4oc2NvcGUuJHBhcmVudCwge30pO1xyXG4gICAgICAgICAgcmV0dXJuIG5nTW9kZWwuJHJlbmRlcigpO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICdzY0RhdGVUaW1lSTE4bicsIGZ1bmN0aW9uIChzY29wZSwgc2NEYXRlVGltZUkxOG4pIHtcclxuICAgICAgICBsZXQgaTtcclxuICAgICAgICBzY29wZS5fZGVmYXVsdERhdGUgPSBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHREYXRlO1xyXG4gICAgICAgIHNjb3BlLl9tb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0TW9kZTtcclxuICAgICAgICBzY29wZS5fZGlzcGxheU1vZGUgPSBzY0RhdGVUaW1lQ29uZmlnLmRpc3BsYXlNb2RlO1xyXG4gICAgICAgIHNjb3BlLl92ZXJ0aWNhbE1vZGUgPSBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRPcmllbnRhdGlvbjtcclxuICAgICAgICBzY29wZS5faG91cnMyNCA9IHNjRGF0ZVRpbWVDb25maWcuZGlzcGxheVR3ZW50eWZvdXI7XHJcbiAgICAgICAgc2NvcGUuX2NvbXBhY3QgPSBzY0RhdGVUaW1lQ29uZmlnLmNvbXBhY3Q7XHJcbiAgICAgICAgc2NvcGUudHJhbnNsYXRpb25zID0gc2NEYXRlVGltZUkxOG47XHJcbiAgICAgICAgc2NvcGUucmVzdHJpY3Rpb25zID0ge1xyXG4gICAgICAgICAgbWluZGF0ZTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgbWF4ZGF0ZTogdW5kZWZpbmVkLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNjb3BlLmFkZFplcm8gPSBmdW5jdGlvbiAobWluKSB7XHJcbiAgICAgICAgICBpZiAobWluID4gOSkgeyByZXR1cm4gbWluLnRvU3RyaW5nKCk7IH0gcmV0dXJuIChgMCR7bWlufWApLnNsaWNlKC0yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5zZXREYXRlID0gZnVuY3Rpb24gKG5ld1ZhbCwgc2F2ZSkge1xyXG4gICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxyXG5cclxuICAgICAgICAgIHNjb3BlLmRhdGUgPSBuZXdWYWwgPyBuZXcgRGF0ZShuZXdWYWwpIDogbmV3IERhdGUoKTtcclxuICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl95ZWFyID0gc2NvcGUuZGF0ZS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgc2NvcGUuY2FsZW5kYXIuX21vbnRoID0gc2NvcGUuZGF0ZS5nZXRNb250aCgpO1xyXG4gICAgICAgICAgc2NvcGUuY2xvY2suX21pbnV0ZXMgPSAvKnNjb3BlLmFkZFplcm8oKi9zY29wZS5kYXRlLmdldE1pbnV0ZXMoKS8qKSovO1xyXG4gICAgICAgICAgc2NvcGUuY2xvY2suX2hvdXJzID0gc2NvcGUuX2hvdXJzMjQgPyBzY29wZS5kYXRlLmdldEhvdXJzKCkgOiBzY29wZS5kYXRlLmdldEhvdXJzKCkgJSAxMjtcclxuICAgICAgICAgIGlmICghc2NvcGUuX2hvdXJzMjQgJiYgKHNjb3BlLmNsb2NrLl9ob3VycyA9PT0gMCkpIHsgc2NvcGUuY2xvY2suX2hvdXJzID0gMTI7IH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gc2NvcGUuY2FsZW5kYXIueWVhckNoYW5nZShzYXZlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5kaXNwbGF5ID0ge1xyXG4gICAgICAgICAgZnVsbFRpdGxlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBfdGltZVN0cmluZyA9IHNjb3BlLl9ob3VyczI0ID8gJ0hIOm1tJyA6ICdoOm1tIGEnO1xyXG4gICAgICAgICAgICBpZiAoKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2Z1bGwnKSAmJiAhc2NvcGUuX3ZlcnRpY2FsTW9kZSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCBgRUVFRSBkIE1NTU0geXl5eSwgJHtfdGltZVN0cmluZ31gKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS5fZGlzcGxheU1vZGUgPT09ICd0aW1lJykge1xyXG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCBfdGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZGF0ZScpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ0VFRSBkIE1NTSB5eXl5Jyk7XHJcbiAgICAgICAgICAgIH0gcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsIGBkIE1NTSB5eXl5LCAke190aW1lU3RyaW5nfWApO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICB0aXRsZSgpIHtcclxuICAgICAgICAgICAgaWYgKHNjb3BlLl9tb2RlID09PSAnZGF0ZScpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2RhdGUnID8gJ0VFRUUnIDogYEVFRUUgJHtcclxuICAgICAgICAgICAgICBzY29wZS5faG91cnMyNCA/ICdISDptbScgOiAnaDptbSBhJ1xyXG4gICAgICAgICAgICB9YCksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdNTU1NIGQgeXl5eScpO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBzdXBlcigpIHtcclxuICAgICAgICAgICAgaWYgKHNjb3BlLl9tb2RlID09PSAnZGF0ZScpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ01NTScpO1xyXG4gICAgICAgICAgICB9IHJldHVybiAnJztcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgbWFpbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoXHJcbiAgICAgICAgICBzY29wZS5fbW9kZSA9PT0gJ2RhdGUnID8gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2QnKVxyXG4gICAgICAgICAgOlxyXG4gICAgICAgICAgICBzY29wZS5faG91cnMyNCA/IF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdISDptbScpXHJcbiAgICAgICAgICAgIDogYCR7X2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2g6bW0nKX08c21hbGw+JHtfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnYScpfTwvc21hbGw+YCxcclxuICAgICAgICApO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBzdWIoKSB7XHJcbiAgICAgICAgICAgIGlmIChzY29wZS5fbW9kZSA9PT0gJ2RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICd5eXl5Jyk7XHJcbiAgICAgICAgICAgIH0gcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdISDptbScpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5jYWxlbmRhciA9IHtcclxuICAgICAgICAgIF9tb250aDogMCxcclxuICAgICAgICAgIF95ZWFyOiAwLFxyXG4gICAgICAgICAgX21vbnRoczogW10sXHJcbiAgICAgICAgICBfYWxsTW9udGhzOiAoKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gMTE7IGkrKykge1xyXG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKF9kYXRlRmlsdGVyKG5ldyBEYXRlKDAsIGkpLCAnTU1NTScpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgIH0pKCkpLFxyXG4gICAgICAgICAgb2Zmc2V0TWFyZ2luKCkgeyByZXR1cm4gYCR7bmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgpLmdldERheSgpICogMi43fXJlbWA7IH0sXHJcblxyXG4gICAgICAgICAgaXNWaXNpYmxlKGQpIHsgcmV0dXJuIG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKS5nZXRNb250aCgpID09PSB0aGlzLl9tb250aDsgfSxcclxuXHJcbiAgICAgICAgICBpc0Rpc2FibGVkKGQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudERhdGUgPSBuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbWluZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xyXG4gICAgICAgICAgICBjb25zdCB7IG1heGRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcclxuICAgICAgICAgICAgcmV0dXJuICgobWluZGF0ZSAhPSBudWxsKSAmJiAoY3VycmVudERhdGUgPCBtaW5kYXRlKSkgfHwgKChtYXhkYXRlICE9IG51bGwpICYmIChjdXJyZW50RGF0ZSA+IG1heGRhdGUpKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgaXNQcmV2TW9udGhCdXR0b25IaWRkZW4oKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBzY29wZS5yZXN0cmljdGlvbnMubWluZGF0ZTtcclxuICAgICAgICAgICAgcmV0dXJuIChkYXRlICE9IG51bGwpICYmICh0aGlzLl9tb250aCA8PSBkYXRlLmdldE1vbnRoKCkpICYmICh0aGlzLl95ZWFyIDw9IGRhdGUuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGlzTmV4dE1vbnRoQnV0dG9uSGlkZGVuKCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gc2NvcGUucmVzdHJpY3Rpb25zLm1heGRhdGU7XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0ZSAhPSBudWxsKSAmJiAodGhpcy5fbW9udGggPj0gZGF0ZS5nZXRNb250aCgpKSAmJiAodGhpcy5feWVhciA+PSBkYXRlLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBjbGFzcyhkKSB7XHJcbiAgICAgICAgICAgIGxldCBjbGFzc1N0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoKHNjb3BlLmRhdGUgIT0gbnVsbCkgJiYgKG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKS5nZXRUaW1lKCkgPT09IG5ldyBEYXRlKHNjb3BlLmRhdGUuZ2V0VGltZSgpKS5zZXRIb3VycygwLFxyXG4gICAgICAgICAgICAwLCAwLCAwKSkpIHtcclxuICAgICAgICAgICAgICBjbGFzc1N0cmluZyArPSAnc2VsZWN0ZWQnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgsIGQpLmdldFRpbWUoKSA9PT0gbmV3IERhdGUoKS5zZXRIb3VycygwLCAwLCAwLCAwKSkge1xyXG4gICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9ICcgdG9kYXknO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY2xhc3NTdHJpbmc7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIHNlbGVjdChkKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RnVsbFllYXIodGhpcy5feWVhciwgdGhpcy5fbW9udGgsIGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgbW9udGhDaGFuZ2Uoc2F2ZSkge1xyXG4gICAgICAgICAgICBpZiAoc2F2ZSA9PSBudWxsKSB7IHNhdmUgPSB0cnVlOyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuX3llYXIgPT0gbnVsbCkgfHwgaXNOYU4odGhpcy5feWVhcikpIHsgdGhpcy5feWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTsgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgeyBtaW5kYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbWF4ZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xyXG4gICAgICAgICAgICBpZiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKG1pbmRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gdGhpcy5feWVhcikgJiYgKG1pbmRhdGUuZ2V0TW9udGgoKSA+PSB0aGlzLl9tb250aCkpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9tb250aCA9IE1hdGgubWF4KG1pbmRhdGUuZ2V0TW9udGgoKSwgdGhpcy5fbW9udGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKG1heGRhdGUgIT0gbnVsbCkgJiYgKG1heGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gdGhpcy5feWVhcikgJiYgKG1heGRhdGUuZ2V0TW9udGgoKSA8PSB0aGlzLl9tb250aCkpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9tb250aCA9IE1hdGgubWluKG1heGRhdGUuZ2V0TW9udGgoKSwgdGhpcy5fbW9udGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoKTtcclxuICAgICAgICAgICAgaWYgKHNjb3BlLmRhdGUuZ2V0TW9udGgoKSAhPT0gdGhpcy5fbW9udGgpIHsgc2NvcGUuZGF0ZS5zZXREYXRlKDApOyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKHNjb3BlLmRhdGUgPCBtaW5kYXRlKSkge1xyXG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RGF0ZShtaW5kYXRlLmdldFRpbWUoKSk7XHJcbiAgICAgICAgICAgICAgc2NvcGUuY2FsZW5kYXIuc2VsZWN0KG1pbmRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKChtYXhkYXRlICE9IG51bGwpICYmIChzY29wZS5kYXRlID4gbWF4ZGF0ZSkpIHtcclxuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldERhdGUobWF4ZGF0ZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLnNlbGVjdChtYXhkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzYXZlKSB7IHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpOyB9XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIF9pbmNNb250aChtb250aHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fbW9udGggKz0gbW9udGhzO1xyXG4gICAgICAgICAgICB3aGlsZSAoKHRoaXMuX21vbnRoIDwgMCkgfHwgKHRoaXMuX21vbnRoID4gMTEpKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX21vbnRoIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGggKz0gMTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl95ZWFyLS07XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoIC09IDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5feWVhcisrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9udGhDaGFuZ2UoKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgeWVhckNoYW5nZShzYXZlKSB7XHJcbiAgICAgICAgICAgIGlmIChzYXZlID09IG51bGwpIHsgc2F2ZSA9IHRydWU7IH1cclxuXHJcbiAgICAgICAgICAgIGlmICgoc2NvcGUuY2FsZW5kYXIuX3llYXIgPT0gbnVsbCkgfHwgKHNjb3BlLmNhbGVuZGFyLl95ZWFyID09PSAnJykpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB7IG1pbmRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcclxuICAgICAgICAgICAgY29uc3QgeyBtYXhkYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XHJcbiAgICAgICAgICAgIGkgPSAobWluZGF0ZSAhPSBudWxsKSAmJiAobWluZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzY29wZS5jYWxlbmRhci5feWVhcikgPyBtaW5kYXRlLmdldE1vbnRoKCkgOiAwO1xyXG4gICAgICAgICAgICBjb25zdCBsZW4gPSAobWF4ZGF0ZSAhPSBudWxsKSAmJiAobWF4ZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzY29wZS5jYWxlbmRhci5feWVhcikgPyBtYXhkYXRlLmdldE1vbnRoKCkgOiAxMTtcclxuICAgICAgICAgICAgc2NvcGUuY2FsZW5kYXIuX21vbnRocyA9IHNjb3BlLmNhbGVuZGFyLl9hbGxNb250aHMuc2xpY2UoaSwgbGVuICsgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5jYWxlbmRhci5tb250aENoYW5nZShzYXZlKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzY29wZS5jbG9jayA9IHtcclxuICAgICAgICAgIF9taW51dGVzOiAwLyonMDAnKi8sXHJcbiAgICAgICAgICBfaG91cnM6IDAsXHJcbiAgICAgICAgICBfaW5jSG91cnMoaW5jKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hvdXJzID0gc2NvcGUuX2hvdXJzMjRcclxuICAgICAgICAgID8gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjMsIHRoaXMuX2hvdXJzICsgaW5jKSlcclxuICAgICAgICAgIDogTWF0aC5tYXgoMSwgTWF0aC5taW4oMTIsIHRoaXMuX2hvdXJzICsgaW5jKSk7XHJcbiAgICAgICAgICAgIGlmIChpc05hTih0aGlzLl9ob3VycykpIHsgcmV0dXJuIHRoaXMuX2hvdXJzID0gMDsgfVxyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBfaW5jTWludXRlcyhpbmMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21pbnV0ZXMgPSAvKnNjb3BlLmFkZFplcm8oKi9NYXRoLm1heCgwLCBNYXRoLm1pbig1OSwgcGFyc2VJbnQodGhpcy5fbWludXRlcykgKyBpbmMpKS8qKS50b1N0cmluZygpKi87XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIHNldEFNKGIpIHtcclxuICAgICAgICAgICAgaWYgKGIgPT0gbnVsbCkgeyBiID0gIXRoaXMuaXNBTSgpOyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYiAmJiAhdGhpcy5pc0FNKCkpIHtcclxuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldEhvdXJzKHNjb3BlLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghYiAmJiB0aGlzLmlzQU0oKSkge1xyXG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0SG91cnMoc2NvcGUuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgaXNBTSgpIHsgcmV0dXJuIHNjb3BlLmRhdGUuZ2V0SG91cnMoKSA8IDEyOyB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2NvcGUuJHdhdGNoKCdjbG9jay5fbWludXRlcycsICh2YWwsIG9sZFZhbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCF2YWwpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgICAgY29uc3QgaW50TWluID0gcGFyc2VJbnQodmFsKTtcclxuICAgICAgICAgIGlmICghaXNOYU4oaW50TWluKSAmJiBpbnRNaW4gPj0gMCAmJiBpbnRNaW4gPD0gNTkgJiYgKGludE1pbiAhPT0gc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkpKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0TWludXRlcyhpbnRNaW4pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBzY29wZS4kd2F0Y2goJ2Nsb2NrLl9ob3VycycsIHZhbCA9PiB7XHJcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiAhaXNOYU4odmFsKSkge1xyXG4gICAgICAgICAgICBpZiAoIXNjb3BlLl9ob3VyczI0KSB7XHJcbiAgICAgICAgICAgICAgaWYgKHZhbCA9PT0gMjQpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IDEyO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsID09PSAxMikge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gMDtcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzY29wZS5jbG9jay5pc0FNKCkpIHsgdmFsICs9IDEyOyB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh2YWwgIT09IHNjb3BlLmRhdGUuZ2V0SG91cnMoKSkge1xyXG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0SG91cnModmFsKTtcclxuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzY29wZS5zZXROb3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBzY29wZS5zZXREYXRlKCk7XHJcbiAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5tb2RlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBpZiAoc2NvcGUuX2Rpc3BsYXlNb2RlICE9IG51bGwpIHsgc2NvcGUuX21vZGUgPSBzY29wZS5fZGlzcGxheU1vZGU7IH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gYCR7c2NvcGUuX3ZlcnRpY2FsTW9kZSA/ICd2ZXJ0aWNhbCAnIDogJyd9JHtcclxuICAgICAgICBzY29wZS5fZGlzcGxheU1vZGUgPT09ICdmdWxsJyA/ICdmdWxsLW1vZGUnXHJcbiAgICAgICAgOiBzY29wZS5fZGlzcGxheU1vZGUgPT09ICd0aW1lJyA/ICd0aW1lLW9ubHknXHJcbiAgICAgICAgOiBzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW9ubHknXHJcbiAgICAgICAgOiBzY29wZS5fbW9kZSA9PT0gJ2RhdGUnID8gJ2RhdGUtbW9kZSdcclxuICAgICAgICA6ICd0aW1lLW1vZGUnfSAke3Njb3BlLl9jb21wYWN0ID8gJ2NvbXBhY3QnIDogJyd9YDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5tb2RlU3dpdGNoID0gKCkgPT4gc2NvcGUuX21vZGUgPSBzY29wZS5fZGlzcGxheU1vZGUgIT0gbnVsbCA/IHNjb3BlLl9kaXNwbGF5TW9kZSA6IHNjb3BlLl9tb2RlID09PSAnZGF0ZScgPyAndGltZScgOiAnZGF0ZSc7XHJcbiAgICAgICAgcmV0dXJuIHNjb3BlLm1vZGVTd2l0Y2hUZXh0ID0gKCkgPT4gYCR7c2NEYXRlVGltZUkxOG4uc3dpdGNoVG99ICR7XHJcbiAgICAgICAgc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/IHNjRGF0ZVRpbWVJMThuLmNsb2NrIDogc2NEYXRlVGltZUkxOG4uY2FsZW5kYXJ9YDtcclxuICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH07XHJcbiAgfSxcclxuXSk7XHJcbiJdfQ==
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-bootstrap.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><button type="button" ng-click="calendar._incMonth(-1)" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-left"></i></button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"> <button type="button" ng-click="calendar._incMonth(1)" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-right"></i></button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" class="btn btn-link day-cell">1</button> <button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" class="btn btn-link day-cell">2</button> <button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" class="btn btn-link day-cell">3</button> <button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" class="btn btn-link day-cell">4</button> <button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" class="btn btn-link day-cell">5</button> <button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" class="btn btn-link day-cell">6</button> <button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" class="btn btn-link day-cell">7</button> <button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" class="btn btn-link day-cell">8</button> <button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" class="btn btn-link day-cell">9</button> <button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" class="btn btn-link day-cell">10</button> <button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" class="btn btn-link day-cell">11</button> <button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" class="btn btn-link day-cell">12</button> <button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" class="btn btn-link day-cell">13</button> <button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" class="btn btn-link day-cell">14</button> <button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" class="btn btn-link day-cell">15</button> <button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" class="btn btn-link day-cell">16</button> <button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" class="btn btn-link day-cell">17</button> <button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" class="btn btn-link day-cell">18</button> <button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" class="btn btn-link day-cell">19</button> <button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" class="btn btn-link day-cell">20</button> <button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" class="btn btn-link day-cell">21</button> <button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" class="btn btn-link day-cell">22</button> <button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" class="btn btn-link day-cell">23</button> <button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" class="btn btn-link day-cell">24</button> <button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" class="btn btn-link day-cell">25</button> <button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" class="btn btn-link day-cell">26</button> <button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" class="btn btn-link day-cell">27</button> <button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" class="btn btn-link day-cell">28</button> <button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" class="btn btn-link day-cell">29</button> <button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" class="btn btn-link day-cell">30</button> <button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" class="btn btn-link day-cell">31</button></div></div><button type="button" ng-click="modeSwitch()" class="btn btn-link switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"> <button type="button" ng-click="clock._incHours(1)" class="btn btn-link hours up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incHours(-1)" class="btn btn-link hours down"><i class="fa fa-caret-down"></i></button> <input type="text" ng-model="clock._minutes"> <button type="button" ng-click="clock._incMinutes(1)" class="btn btn-link minutes up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incMinutes(-1)" class="btn btn-link minutes down"><i class="fa fa-caret-down"></i></button></div><div ng-if="!_hours24" class="buttons"><button type="button" ng-click="clock.setAM()" class="btn btn-link">{{date | date:\'a\'}}</button></div></div></div></div><div class="buttons"><button type="button" ng-click="setNow()" class="btn btn-link">{{:: translations.now}}</button> <button type="button" ng-click="cancel()" ng-if="!autosave" class="btn btn-link">{{:: translations.cancel}}</button> <button type="button" ng-click="save()" ng-if="!autosave" class="btn btn-link">{{:: translations.save}}</button></div></div>');

}]);
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-material.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><md-button type="button" ng-click="calendar._incMonth(-1)" aria-label="{{:: translations.previousMonth}}" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}"><!--i.fa.fa-caret-left--><md-icon>keyboard_arrow_left</md-icon></md-button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"><md-button type="button" ng-click="calendar._incMonth(1)" aria-label="{{:: translations.nextMonth}}" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}"><!--i.fa.fa-caret-right--><md-icon>keyboard_arrow_right</md-icon></md-button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><md-button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" aria-label="1" class="day-cell">1</md-button><md-button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" aria-label="2" class="day-cell">2</md-button><md-button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" aria-label="3" class="day-cell">3</md-button><md-button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" aria-label="4" class="day-cell">4</md-button><md-button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" aria-label="5" class="day-cell">5</md-button><md-button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" aria-label="6" class="day-cell">6</md-button><md-button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" aria-label="7" class="day-cell">7</md-button><md-button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" aria-label="8" class="day-cell">8</md-button><md-button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" aria-label="9" class="day-cell">9</md-button><md-button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" aria-label="10" class="day-cell">10</md-button><md-button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" aria-label="11" class="day-cell">11</md-button><md-button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" aria-label="12" class="day-cell">12</md-button><md-button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" aria-label="13" class="day-cell">13</md-button><md-button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" aria-label="14" class="day-cell">14</md-button><md-button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" aria-label="15" class="day-cell">15</md-button><md-button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" aria-label="16" class="day-cell">16</md-button><md-button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" aria-label="17" class="day-cell">17</md-button><md-button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" aria-label="18" class="day-cell">18</md-button><md-button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" aria-label="19" class="day-cell">19</md-button><md-button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" aria-label="20" class="day-cell">20</md-button><md-button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" aria-label="21" class="day-cell">21</md-button><md-button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" aria-label="22" class="day-cell">22</md-button><md-button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" aria-label="23" class="day-cell">23</md-button><md-button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" aria-label="24" class="day-cell">24</md-button><md-button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" aria-label="25" class="day-cell">25</md-button><md-button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" aria-label="26" class="day-cell">26</md-button><md-button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" aria-label="27" class="day-cell">27</md-button><md-button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" aria-label="28" class="day-cell">28</md-button><md-button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" aria-label="29" class="day-cell">29</md-button><md-button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" aria-label="30" class="day-cell">30</md-button><md-button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" aria-label="31" class="day-cell">31</md-button></div></div><md-button type="button" ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="switch-control"><!--i.fa.fa-clock-o--><md-icon>access_time</md-icon><!--i.fa.fa-calendar--><md-icon>today</md-icon><span class="visuallyhidden">{{modeSwitchText()}}</span></md-button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"><md-button type="button" ng-click="clock._incHours(1)" aria-label="{{:: translations.incrementHours}}" class="hours up"><!--i.fa.fa-caret-up--><md-icon>arrow_drop_up</md-icon></md-button><md-button type="button" ng-click="clock._incHours(-1)" aria-label="{{:: translations.decrementHours}}" class="hours down"><!--i.fa.fa-caret-down--><md-icon>arrow_drop_down</md-icon></md-button><input type="number" min="0" max="59" ng-model="clock._minutes"><md-button type="button" ng-click="clock._incMinutes(1)" aria-label="{{:: translations.incrementMinutes}}" class="minutes up"><!--i.fa.fa-caret-up--><md-icon>arrow_drop_up</md-icon></md-button><md-button type="button" ng-click="clock._incMinutes(-1)" aria-label="{{:: translations.decrementMinutes}}" class="minutes down"><!--i.fa.fa-caret-down--><md-icon>arrow_drop_down</md-icon></md-button></div><div ng-if="!_hours24" class="buttons"><md-button type="button" ng-click="clock.setAM()" aria-label="{{:: translations.switchAmPm}}">{{date | date:\'a\'}}</md-button></div></div></div></div><div class="buttons"><md-button type="button" ng-click="setNow()" aria-label="{{:: translations.now}}">{{:: translations.now}}</md-button><md-button type="button" ng-click="clear()" aria-label="{{:: translations.clear}}">{{:: translations.clear}}</md-button><md-button type="button" ng-click="cancel()" ng-if="!autosave" aria-label="{{:: translations.cancel}}">{{:: translations.cancel}}</md-button><md-button type="button" ng-click="save()" ng-if="!autosave" aria-label="{{:: translations.save}}">{{:: translations.save}}</md-button></div></div>');

}]);