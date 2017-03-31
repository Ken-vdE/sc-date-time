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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiTU9EVUxFX05BTUUiLCJtb2R1bGUiLCJ2YWx1ZSIsImRlZmF1bHRUaGVtZSIsImF1dG9zYXZlIiwiZGVmYXVsdE1vZGUiLCJkZWZhdWx0RGF0ZSIsInVuZGVmaW5lZCIsImRpc3BsYXlNb2RlIiwiZGVmYXVsdE9yaWVudGF0aW9uIiwiZGlzcGxheVR3ZW50eWZvdXIiLCJjb21wYWN0IiwicHJldmlvdXNNb250aCIsIm5leHRNb250aCIsImluY3JlbWVudEhvdXJzIiwiZGVjcmVtZW50SG91cnMiLCJpbmNyZW1lbnRNaW51dGVzIiwiZGVjcmVtZW50TWludXRlcyIsInN3aXRjaEFtUG0iLCJub3ciLCJjYW5jZWwiLCJzYXZlIiwid2Vla2RheXMiLCJzd2l0Y2hUbyIsImNsb2NrIiwiY2FsZW5kYXIiLCJkaXJlY3RpdmUiLCIkZmlsdGVyIiwiJHNjZSIsIiRyb290U2NvcGUiLCIkcGFyc2UiLCJzY0RhdGVUaW1lSTE4biIsInNjRGF0ZVRpbWVDb25maWciLCJfZGF0ZUZpbHRlciIsInJlc3RyaWN0IiwicmVwbGFjZSIsInNjb3BlIiwiX3dlZWtkYXlzIiwicmVxdWlyZSIsInRlbXBsYXRlVXJsIiwidEVsZW1lbnQiLCJ0QXR0cnMiLCJ0aGVtZSIsImluZGV4T2YiLCJsaW5rIiwiZWxlbWVudCIsImF0dHJzIiwibmdNb2RlbCIsIiRvYnNlcnZlIiwidmFsIiwiX21vZGUiLCJfZGVmYXVsdERhdGUiLCJEYXRlIiwicGFyc2UiLCJfZGlzcGxheU1vZGUiLCJfdmVydGljYWxNb2RlIiwiX2NvbXBhY3QiLCJfaG91cnMyNCIsInJlc3RyaWN0aW9ucyIsIm1pbmRhdGUiLCJzZXRIb3VycyIsIm1heGRhdGUiLCIkd2F0Y2giLCJpc0FycmF5IiwiJHJlbmRlciIsInNldERhdGUiLCIkbW9kZWxWYWx1ZSIsImZvckVhY2giLCJmaW5kIiwiaW5wdXQiLCJvbiIsInNldFRpbWVvdXQiLCJzZWxlY3QiLCJzYXZlVXBkYXRlRGF0ZSIsIiRzZXRWaWV3VmFsdWUiLCJkYXRlIiwic2F2ZUZuIiwib25TYXZlIiwiY2FuY2VsRm4iLCJvbkNhbmNlbCIsIiRwYXJlbnQiLCIkdmFsdWUiLCJjb250cm9sbGVyIiwiaSIsInRyYW5zbGF0aW9ucyIsImFkZFplcm8iLCJtaW4iLCJ0b1N0cmluZyIsInNsaWNlIiwibmV3VmFsIiwiX3llYXIiLCJnZXRGdWxsWWVhciIsIl9tb250aCIsImdldE1vbnRoIiwiX21pbnV0ZXMiLCJnZXRNaW51dGVzIiwiX2hvdXJzIiwiZ2V0SG91cnMiLCJ5ZWFyQ2hhbmdlIiwiZGlzcGxheSIsImZ1bGxUaXRsZSIsIl90aW1lU3RyaW5nIiwidGl0bGUiLCJzdXBlciIsIm1haW4iLCJ0cnVzdEFzSHRtbCIsInN1YiIsIl9tb250aHMiLCJfYWxsTW9udGhzIiwicmVzdWx0IiwicHVzaCIsIm9mZnNldE1hcmdpbiIsImdldERheSIsImlzVmlzaWJsZSIsImQiLCJpc0Rpc2FibGVkIiwiY3VycmVudERhdGUiLCJpc1ByZXZNb250aEJ1dHRvbkhpZGRlbiIsImlzTmV4dE1vbnRoQnV0dG9uSGlkZGVuIiwiY2xhc3MiLCJjbGFzc1N0cmluZyIsImdldFRpbWUiLCJzZXRGdWxsWWVhciIsIm1vbnRoQ2hhbmdlIiwiaXNOYU4iLCJNYXRoIiwibWF4IiwiZ2V0RGF0ZSIsIl9pbmNNb250aCIsIm1vbnRocyIsImxlbiIsIl9pbmNIb3VycyIsImluYyIsIl9pbmNNaW51dGVzIiwicGFyc2VJbnQiLCJzZXRBTSIsImIiLCJpc0FNIiwib2xkVmFsIiwiaW50TWluIiwic2V0TWludXRlcyIsInNldE5vdyIsIm1vZGVDbGFzcyIsIm1vZGVTd2l0Y2giLCJtb2RlU3dpdGNoVGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsTUFBTUEsY0FBYyxZQUFwQjs7b0JBRWVBLFc7OztBQUVmLG9CQUFRQyxNQUFSLENBQWVELFdBQWYsRUFBNEIsRUFBNUIsRUFDQ0UsS0FERCxDQUNPLGtCQURQLEVBQzJCO0FBQ3pC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bEIsTUFBTWtCLFlBQW5DLEdBQWtEbEIsTUFBTWMsS0FBTixLQUFnQixNQUFoQixHQUF5QixNQUF6QixHQUFrQyxNQUF4RztBQUFBLFNBQW5CO0FBQ0EsZUFBT2QsTUFBTTRHLGNBQU4sR0FBdUI7QUFBQSxpQkFBU2pILGVBQWVSLFFBQXhCLFVBQzlCYSxNQUFNYyxLQUFOLEtBQWdCLE1BQWhCLEdBQXlCbkIsZUFBZVAsS0FBeEMsR0FBZ0RPLGVBQWVOLFFBRGpDO0FBQUEsU0FBOUI7QUFFRCxPQWxRVztBQS9FUCxLQUFQO0FBb1ZELEdBdlYyQixDQTNCOUIiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhbmd1bGFyIGZyb20gJ2FuZ3VsYXInO1xyXG5cclxuY29uc3QgTU9EVUxFX05BTUUgPSAnc2NEYXRlVGltZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNT0RVTEVfTkFNRTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKE1PRFVMRV9OQU1FLCBbXSlcclxuLnZhbHVlKCdzY0RhdGVUaW1lQ29uZmlnJywge1xyXG4gIGRlZmF1bHRUaGVtZTogJ21hdGVyaWFsJyxcclxuICBhdXRvc2F2ZTogZmFsc2UsXHJcbiAgZGVmYXVsdE1vZGU6ICdkYXRlJyxcclxuICBkZWZhdWx0RGF0ZTogdW5kZWZpbmVkLCAvLyBzaG91bGQgYmUgZGF0ZSBvYmplY3QhIVxyXG4gIGRpc3BsYXlNb2RlOiB1bmRlZmluZWQsXHJcbiAgZGVmYXVsdE9yaWVudGF0aW9uOiBmYWxzZSxcclxuICBkaXNwbGF5VHdlbnR5Zm91cjogZmFsc2UsXHJcbiAgY29tcGFjdDogZmFsc2UsXHJcbn0sXHJcbikudmFsdWUoJ3NjRGF0ZVRpbWVJMThuJywge1xyXG4gIHByZXZpb3VzTW9udGg6ICdQcmV2aW91cyBNb250aCcsXHJcbiAgbmV4dE1vbnRoOiAnTmV4dCBNb250aCcsXHJcbiAgaW5jcmVtZW50SG91cnM6ICdJbmNyZW1lbnQgSG91cnMnLFxyXG4gIGRlY3JlbWVudEhvdXJzOiAnRGVjcmVtZW50IEhvdXJzJyxcclxuICBpbmNyZW1lbnRNaW51dGVzOiAnSW5jcmVtZW50IE1pbnV0ZXMnLFxyXG4gIGRlY3JlbWVudE1pbnV0ZXM6ICdEZWNyZW1lbnQgTWludXRlcycsXHJcbiAgc3dpdGNoQW1QbTogJ1N3aXRjaCBBTS9QTScsXHJcbiAgbm93OiAnTm93JyxcclxuICBjYW5jZWw6ICdDYW5jZWwnLFxyXG4gIHNhdmU6ICdTYXZlJyxcclxuICB3ZWVrZGF5czogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXHJcbiAgc3dpdGNoVG86ICdTd2l0Y2ggdG8nLFxyXG4gIGNsb2NrOiAnQ2xvY2snLFxyXG4gIGNhbGVuZGFyOiAnQ2FsZW5kYXInLFxyXG59LFxyXG4pLmRpcmVjdGl2ZSgndGltZURhdGVQaWNrZXInLCBbJyRmaWx0ZXInLCAnJHNjZScsICckcm9vdFNjb3BlJywgJyRwYXJzZScsICdzY0RhdGVUaW1lSTE4bicsICdzY0RhdGVUaW1lQ29uZmlnJyxcclxuICBmdW5jdGlvbiAoJGZpbHRlciwgJHNjZSwgJHJvb3RTY29wZSwgJHBhcnNlLCBzY0RhdGVUaW1lSTE4biwgc2NEYXRlVGltZUNvbmZpZykge1xyXG4gICAgY29uc3QgX2RhdGVGaWx0ZXIgPSAkZmlsdGVyKCdkYXRlJyk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0FFJyxcclxuICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBfd2Vla2RheXM6ICc9P3RkV2Vla2RheXMnLFxyXG4gICAgICB9LFxyXG4gICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXHJcbiAgICAgIHRlbXBsYXRlVXJsKHRFbGVtZW50LCB0QXR0cnMpIHtcclxuICAgICAgICBpZiAoKHRBdHRycy50aGVtZSA9PSBudWxsKSB8fCAodEF0dHJzLnRoZW1lID09PSAnJykpIHsgdEF0dHJzLnRoZW1lID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0VGhlbWU7IH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRBdHRycy50aGVtZS5pbmRleE9mKCcvJykgPD0gMCA/IGBzY0RhdGVUaW1lLSR7dEF0dHJzLnRoZW1lfS50cGxgIDogdEF0dHJzLnRoZW1lO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcclxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGVmYXVsdE1vZGUnLCB2YWwgPT4ge1xyXG4gICAgICAgICAgaWYgKCh2YWwgIT09ICd0aW1lJykgJiYgKHZhbCAhPT0gJ2RhdGUnKSkgeyB2YWwgPSBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRNb2RlOyB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLl9tb2RlID0gdmFsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkZWZhdWx0RGF0ZScsIHZhbCA9PlxyXG4gICAgICAgIHNjb3BlLl9kZWZhdWx0RGF0ZSA9ICh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpID8gRGF0ZS5wYXJzZSh2YWwpXHJcbiAgICAgICAgOiBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHREYXRlLFxyXG4gICAgICApO1xyXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkaXNwbGF5TW9kZScsIHZhbCA9PiB7XHJcbiAgICAgICAgICBpZiAoKHZhbCAhPT0gJ2Z1bGwnKSAmJiAodmFsICE9PSAndGltZScpICYmICh2YWwgIT09ICdkYXRlJykpIHsgdmFsID0gc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5TW9kZTsgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBzY29wZS5fZGlzcGxheU1vZGUgPSB2YWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ29yaWVudGF0aW9uJywgdmFsID0+IHNjb3BlLl92ZXJ0aWNhbE1vZGUgPSAodmFsICE9IG51bGwpID8gdmFsID09PSAndHJ1ZScgOiBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRPcmllbnRhdGlvbik7XHJcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2NvbXBhY3QnLCB2YWwgPT4gc2NvcGUuX2NvbXBhY3QgPSAodmFsICE9IG51bGwpID8gdmFsID09PSAndHJ1ZScgOiBzY0RhdGVUaW1lQ29uZmlnLmNvbXBhY3QpO1xyXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkaXNwbGF5VHdlbnR5Zm91cicsIHZhbCA9PiBzY29wZS5faG91cnMyNCA9ICh2YWwgIT0gbnVsbCkgPyB2YWwgOiBzY0RhdGVUaW1lQ29uZmlnLmRpc3BsYXlUd2VudHlmb3VyKTtcclxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbWluZGF0ZScsIHZhbCA9PiB7XHJcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiBEYXRlLnBhcnNlKHZhbCkpIHtcclxuICAgICAgICAgICAgc2NvcGUucmVzdHJpY3Rpb25zLm1pbmRhdGUgPSBuZXcgRGF0ZSh2YWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUucmVzdHJpY3Rpb25zLm1pbmRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ21heGRhdGUnLCB2YWwgPT4ge1xyXG4gICAgICAgICAgaWYgKCh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnJlc3RyaWN0aW9ucy5tYXhkYXRlID0gbmV3IERhdGUodmFsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnJlc3RyaWN0aW9ucy5tYXhkYXRlLnNldEhvdXJzKDIzLCA1OSwgNTksIDk5OSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2NvcGUuX3dlZWtkYXlzID0gc2NvcGUuX3dlZWtkYXlzIHx8IHNjRGF0ZVRpbWVJMThuLndlZWtkYXlzO1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaCgnX3dlZWtkYXlzJywgdmFsdWUgPT4ge1xyXG4gICAgICAgICAgaWYgKCh2YWx1ZSA9PSBudWxsKSB8fCAhYW5ndWxhci5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuX3dlZWtkYXlzID0gc2NEYXRlVGltZUkxOG4ud2Vla2RheXM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG5nTW9kZWwuJHJlbmRlciA9ICgpID0+IHNjb3BlLnNldERhdGUobmdNb2RlbC4kbW9kZWxWYWx1ZSAhPSBudWxsID8gbmdNb2RlbC4kbW9kZWxWYWx1ZSA6IHNjb3BlLl9kZWZhdWx0RGF0ZSwgKG5nTW9kZWwuJG1vZGVsVmFsdWUgIT0gbnVsbCkpO1xyXG5cclxuICAgICAgICAvLyBTZWxlY3QgY29udGVudHMgb2YgaW5wdXRzIHdoZW4gZm9jY3Vzc2VkIGludG9cclxuICAgICAgICBhbmd1bGFyLmZvckVhY2goZWxlbWVudC5maW5kKCdpbnB1dCcpLFxyXG4gICAgICAgIGlucHV0ID0+XHJcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoaW5wdXQpLm9uKCdmb2N1cycsICgpID0+IHNldFRpbWVvdXQoKCgpID0+IGlucHV0LnNlbGVjdCgpKSwgMTApKSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgICAgc2NvcGUuYXV0b3NhdmUgPSBmYWxzZTtcclxuICAgICAgICBpZiAoKGF0dHJzLmF1dG9zYXZlICE9IG51bGwpIHx8IHNjRGF0ZVRpbWVDb25maWcuYXV0b3NhdmUpIHtcclxuICAgICAgICAgIHNjb3BlLnNhdmVVcGRhdGVEYXRlID0gKCkgPT4gbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHNjb3BlLmRhdGUpO1xyXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmF1dG9zYXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNhdmVGbiA9ICRwYXJzZShhdHRycy5vblNhdmUpO1xyXG4gICAgICAgIGNvbnN0IGNhbmNlbEZuID0gJHBhcnNlKGF0dHJzLm9uQ2FuY2VsKTtcclxuICAgICAgICBzY29wZS5zYXZlVXBkYXRlRGF0ZSA9ICgpID0+IHRydWU7XHJcblxyXG4gICAgICAgIHNjb3BlLnNhdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUobmV3IERhdGUoc2NvcGUuZGF0ZSkpO1xyXG4gICAgICAgICAgcmV0dXJuIHNhdmVGbihzY29wZS4kcGFyZW50LCB7ICR2YWx1ZTogbmV3IERhdGUoc2NvcGUuZGF0ZSkgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGNhbmNlbEZuKHNjb3BlLiRwYXJlbnQsIHt9KTtcclxuICAgICAgICAgIHJldHVybiBuZ01vZGVsLiRyZW5kZXIoKTtcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnc2NEYXRlVGltZUkxOG4nLCBmdW5jdGlvbiAoc2NvcGUsIHNjRGF0ZVRpbWVJMThuKSB7XHJcbiAgICAgICAgbGV0IGk7XHJcbiAgICAgICAgc2NvcGUuX2RlZmF1bHREYXRlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0RGF0ZTtcclxuICAgICAgICBzY29wZS5fbW9kZSA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdE1vZGU7XHJcbiAgICAgICAgc2NvcGUuX2Rpc3BsYXlNb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5TW9kZTtcclxuICAgICAgICBzY29wZS5fdmVydGljYWxNb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0T3JpZW50YXRpb247XHJcbiAgICAgICAgc2NvcGUuX2hvdXJzMjQgPSBzY0RhdGVUaW1lQ29uZmlnLmRpc3BsYXlUd2VudHlmb3VyO1xyXG4gICAgICAgIHNjb3BlLl9jb21wYWN0ID0gc2NEYXRlVGltZUNvbmZpZy5jb21wYWN0O1xyXG4gICAgICAgIHNjb3BlLnRyYW5zbGF0aW9ucyA9IHNjRGF0ZVRpbWVJMThuO1xyXG4gICAgICAgIHNjb3BlLnJlc3RyaWN0aW9ucyA9IHtcclxuICAgICAgICAgIG1pbmRhdGU6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIG1heGRhdGU6IHVuZGVmaW5lZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5hZGRaZXJvID0gZnVuY3Rpb24gKG1pbikge1xyXG4gICAgICAgICAgaWYgKG1pbiA+IDkpIHsgcmV0dXJuIG1pbi50b1N0cmluZygpOyB9IHJldHVybiAoYDAke21pbn1gKS5zbGljZSgtMik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuc2V0RGF0ZSA9IGZ1bmN0aW9uIChuZXdWYWwsIHNhdmUpIHtcclxuICAgICAgICAgIGlmIChzYXZlID09IG51bGwpIHsgc2F2ZSA9IHRydWU7IH1cclxuXHJcbiAgICAgICAgICBzY29wZS5kYXRlID0gbmV3VmFsID8gbmV3IERhdGUobmV3VmFsKSA6IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICBzY29wZS5jYWxlbmRhci5feWVhciA9IHNjb3BlLmRhdGUuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl9tb250aCA9IHNjb3BlLmRhdGUuZ2V0TW9udGgoKTtcclxuICAgICAgICAgIHNjb3BlLmNsb2NrLl9taW51dGVzID0gLypzY29wZS5hZGRaZXJvKCovc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkvKikqLztcclxuICAgICAgICAgIHNjb3BlLmNsb2NrLl9ob3VycyA9IHNjb3BlLl9ob3VyczI0ID8gc2NvcGUuZGF0ZS5nZXRIb3VycygpIDogc2NvcGUuZGF0ZS5nZXRIb3VycygpICUgMTI7XHJcbiAgICAgICAgICBpZiAoIXNjb3BlLl9ob3VyczI0ICYmIChzY29wZS5jbG9jay5faG91cnMgPT09IDApKSB7IHNjb3BlLmNsb2NrLl9ob3VycyA9IDEyOyB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmNhbGVuZGFyLnllYXJDaGFuZ2Uoc2F2ZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuZGlzcGxheSA9IHtcclxuICAgICAgICAgIGZ1bGxUaXRsZSgpIHtcclxuICAgICAgICAgICAgY29uc3QgX3RpbWVTdHJpbmcgPSBzY29wZS5faG91cnMyNCA/ICdISDptbScgOiAnaDptbSBhJztcclxuICAgICAgICAgICAgaWYgKChzY29wZS5fZGlzcGxheU1vZGUgPT09ICdmdWxsJykgJiYgIXNjb3BlLl92ZXJ0aWNhbE1vZGUpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgYEVFRUUgZCBNTU1NIHl5eXksICR7X3RpbWVTdHJpbmd9YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAndGltZScpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgX3RpbWVTdHJpbmcpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdFRUUgZCBNTU0geXl5eScpO1xyXG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCBgZCBNTU0geXl5eSwgJHtfdGltZVN0cmluZ31gKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgdGl0bGUoKSB7XHJcbiAgICAgICAgICAgIGlmIChzY29wZS5fbW9kZSA9PT0gJ2RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsIChzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJyA/ICdFRUVFJyA6IGBFRUVFICR7XHJcbiAgICAgICAgICAgICAgc2NvcGUuX2hvdXJzMjQgPyAnSEg6bW0nIDogJ2g6bW0gYSdcclxuICAgICAgICAgICAgfWApLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnTU1NTSBkIHl5eXknKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgc3VwZXIoKSB7XHJcbiAgICAgICAgICAgIGlmIChzY29wZS5fbW9kZSA9PT0gJ2RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdNTU0nKTtcclxuICAgICAgICAgICAgfSByZXR1cm4gJyc7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG1haW4oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKFxyXG4gICAgICAgICAgc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/IF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdkJylcclxuICAgICAgICAgIDpcclxuICAgICAgICAgICAgc2NvcGUuX2hvdXJzMjQgPyBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnSEg6bW0nKVxyXG4gICAgICAgICAgICA6IGAke19kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdoOm1tJyl9PHNtYWxsPiR7X2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2EnKX08L3NtYWxsPmAsXHJcbiAgICAgICAgKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgc3ViKCkge1xyXG4gICAgICAgICAgICBpZiAoc2NvcGUuX21vZGUgPT09ICdkYXRlJykge1xyXG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAneXl5eScpO1xyXG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnSEg6bW0nKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuY2FsZW5kYXIgPSB7XHJcbiAgICAgICAgICBfbW9udGg6IDAsXHJcbiAgICAgICAgICBfeWVhcjogMCxcclxuICAgICAgICAgIF9tb250aHM6IFtdLFxyXG4gICAgICAgICAgX2FsbE1vbnRoczogKCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDw9IDExOyBpKyspIHtcclxuICAgICAgICAgICAgICByZXN1bHQucHVzaChfZGF0ZUZpbHRlcihuZXcgRGF0ZSgwLCBpKSwgJ01NTU0nKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICB9KSgpKSxcclxuICAgICAgICAgIG9mZnNldE1hcmdpbigpIHsgcmV0dXJuIGAke25ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoKS5nZXREYXkoKSAqIDIuN31yZW1gOyB9LFxyXG5cclxuICAgICAgICAgIGlzVmlzaWJsZShkKSB7IHJldHVybiBuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0TW9udGgoKSA9PT0gdGhpcy5fbW9udGg7IH0sXHJcblxyXG4gICAgICAgICAgaXNEaXNhYmxlZChkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgsIGQpO1xyXG4gICAgICAgICAgICBjb25zdCB7IG1pbmRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcclxuICAgICAgICAgICAgY29uc3QgeyBtYXhkYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XHJcbiAgICAgICAgICAgIHJldHVybiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKGN1cnJlbnREYXRlIDwgbWluZGF0ZSkpIHx8ICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAoY3VycmVudERhdGUgPiBtYXhkYXRlKSk7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGlzUHJldk1vbnRoQnV0dG9uSGlkZGVuKCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gc2NvcGUucmVzdHJpY3Rpb25zLm1pbmRhdGU7XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0ZSAhPSBudWxsKSAmJiAodGhpcy5fbW9udGggPD0gZGF0ZS5nZXRNb250aCgpKSAmJiAodGhpcy5feWVhciA8PSBkYXRlLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBpc05leHRNb250aEJ1dHRvbkhpZGRlbigpIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHNjb3BlLnJlc3RyaWN0aW9ucy5tYXhkYXRlO1xyXG4gICAgICAgICAgICByZXR1cm4gKGRhdGUgIT0gbnVsbCkgJiYgKHRoaXMuX21vbnRoID49IGRhdGUuZ2V0TW9udGgoKSkgJiYgKHRoaXMuX3llYXIgPj0gZGF0ZS5nZXRGdWxsWWVhcigpKTtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgY2xhc3MoZCkge1xyXG4gICAgICAgICAgICBsZXQgY2xhc3NTdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgaWYgKChzY29wZS5kYXRlICE9IG51bGwpICYmIChuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0VGltZSgpID09PSBuZXcgRGF0ZShzY29wZS5kYXRlLmdldFRpbWUoKSkuc2V0SG91cnMoMCxcclxuICAgICAgICAgICAgMCwgMCwgMCkpKSB7XHJcbiAgICAgICAgICAgICAgY2xhc3NTdHJpbmcgKz0gJ3NlbGVjdGVkJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKS5nZXRUaW1lKCkgPT09IG5ldyBEYXRlKCkuc2V0SG91cnMoMCwgMCwgMCwgMCkpIHtcclxuICAgICAgICAgICAgICBjbGFzc1N0cmluZyArPSAnIHRvZGF5JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNsYXNzU3RyaW5nO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBzZWxlY3QoZCkge1xyXG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnNhdmVVcGRhdGVEYXRlKCk7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG1vbnRoQ2hhbmdlKHNhdmUpIHtcclxuICAgICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCh0aGlzLl95ZWFyID09IG51bGwpIHx8IGlzTmFOKHRoaXMuX3llYXIpKSB7IHRoaXMuX3llYXIgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCk7IH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHsgbWluZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xyXG4gICAgICAgICAgICBjb25zdCB7IG1heGRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcclxuICAgICAgICAgICAgaWYgKChtaW5kYXRlICE9IG51bGwpICYmIChtaW5kYXRlLmdldEZ1bGxZZWFyKCkgPT09IHRoaXMuX3llYXIpICYmIChtaW5kYXRlLmdldE1vbnRoKCkgPj0gdGhpcy5fbW9udGgpKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fbW9udGggPSBNYXRoLm1heChtaW5kYXRlLmdldE1vbnRoKCksIHRoaXMuX21vbnRoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKChtYXhkYXRlICE9IG51bGwpICYmIChtYXhkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHRoaXMuX3llYXIpICYmIChtYXhkYXRlLmdldE1vbnRoKCkgPD0gdGhpcy5fbW9udGgpKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fbW9udGggPSBNYXRoLm1pbihtYXhkYXRlLmdldE1vbnRoKCksIHRoaXMuX21vbnRoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLl95ZWFyLCB0aGlzLl9tb250aCk7XHJcbiAgICAgICAgICAgIGlmIChzY29wZS5kYXRlLmdldE1vbnRoKCkgIT09IHRoaXMuX21vbnRoKSB7IHNjb3BlLmRhdGUuc2V0RGF0ZSgwKTsgfVxyXG5cclxuICAgICAgICAgICAgaWYgKChtaW5kYXRlICE9IG51bGwpICYmIChzY29wZS5kYXRlIDwgbWluZGF0ZSkpIHtcclxuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldERhdGUobWluZGF0ZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLnNlbGVjdChtaW5kYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAoc2NvcGUuZGF0ZSA+IG1heGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXREYXRlKG1heGRhdGUuZ2V0VGltZSgpKTtcclxuICAgICAgICAgICAgICBzY29wZS5jYWxlbmRhci5zZWxlY3QobWF4ZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc2F2ZSkgeyByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTsgfVxyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBfaW5jTW9udGgobW9udGhzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21vbnRoICs9IG1vbnRocztcclxuICAgICAgICAgICAgd2hpbGUgKCh0aGlzLl9tb250aCA8IDApIHx8ICh0aGlzLl9tb250aCA+IDExKSkge1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLl9tb250aCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoICs9IDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5feWVhci0tO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tb250aCAtPSAxMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3llYXIrKztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vbnRoQ2hhbmdlKCk7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIHllYXJDaGFuZ2Uoc2F2ZSkge1xyXG4gICAgICAgICAgICBpZiAoc2F2ZSA9PSBudWxsKSB7IHNhdmUgPSB0cnVlOyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKHNjb3BlLmNhbGVuZGFyLl95ZWFyID09IG51bGwpIHx8IChzY29wZS5jYWxlbmRhci5feWVhciA9PT0gJycpKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgeyBtaW5kYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbWF4ZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xyXG4gICAgICAgICAgICBpID0gKG1pbmRhdGUgIT0gbnVsbCkgJiYgKG1pbmRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2NvcGUuY2FsZW5kYXIuX3llYXIpID8gbWluZGF0ZS5nZXRNb250aCgpIDogMDtcclxuICAgICAgICAgICAgY29uc3QgbGVuID0gKG1heGRhdGUgIT0gbnVsbCkgJiYgKG1heGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2NvcGUuY2FsZW5kYXIuX3llYXIpID8gbWF4ZGF0ZS5nZXRNb250aCgpIDogMTE7XHJcbiAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl9tb250aHMgPSBzY29wZS5jYWxlbmRhci5fYWxsTW9udGhzLnNsaWNlKGksIGxlbiArIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuY2FsZW5kYXIubW9udGhDaGFuZ2Uoc2F2ZSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2NvcGUuY2xvY2sgPSB7XHJcbiAgICAgICAgICBfbWludXRlczogMC8qJzAwJyovLFxyXG4gICAgICAgICAgX2hvdXJzOiAwLFxyXG4gICAgICAgICAgX2luY0hvdXJzKGluYykge1xyXG4gICAgICAgICAgICB0aGlzLl9ob3VycyA9IHNjb3BlLl9ob3VyczI0XHJcbiAgICAgICAgICA/IE1hdGgubWF4KDAsIE1hdGgubWluKDIzLCB0aGlzLl9ob3VycyArIGluYykpXHJcbiAgICAgICAgICA6IE1hdGgubWF4KDEsIE1hdGgubWluKDEyLCB0aGlzLl9ob3VycyArIGluYykpO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4odGhpcy5faG91cnMpKSB7IHJldHVybiB0aGlzLl9ob3VycyA9IDA7IH1cclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgX2luY01pbnV0ZXMoaW5jKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9taW51dGVzID0gLypzY29wZS5hZGRaZXJvKCovTWF0aC5tYXgoMCwgTWF0aC5taW4oNTksIHBhcnNlSW50KHRoaXMuX21pbnV0ZXMpICsgaW5jKSkvKikudG9TdHJpbmcoKSovO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBzZXRBTShiKSB7XHJcbiAgICAgICAgICAgIGlmIChiID09IG51bGwpIHsgYiA9ICF0aGlzLmlzQU0oKTsgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGIgJiYgIXRoaXMuaXNBTSgpKSB7XHJcbiAgICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRIb3VycyhzY29wZS5kYXRlLmdldEhvdXJzKCkgLSAxMik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWIgJiYgdGhpcy5pc0FNKCkpIHtcclxuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldEhvdXJzKHNjb3BlLmRhdGUuZ2V0SG91cnMoKSArIDEyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnNhdmVVcGRhdGVEYXRlKCk7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGlzQU0oKSB7IHJldHVybiBzY29wZS5kYXRlLmdldEhvdXJzKCkgPCAxMjsgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaCgnY2xvY2suX21pbnV0ZXMnLCAodmFsLCBvbGRWYWwpID0+IHtcclxuICAgICAgICAgIGlmICghdmFsKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGludE1pbiA9IHBhcnNlSW50KHZhbCk7XHJcbiAgICAgICAgICBpZiAoIWlzTmFOKGludE1pbikgJiYgaW50TWluID49IDAgJiYgaW50TWluIDw9IDU5ICYmIChpbnRNaW4gIT09IHNjb3BlLmRhdGUuZ2V0TWludXRlcygpKSkge1xyXG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldE1pbnV0ZXMoaW50TWluKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnNhdmVVcGRhdGVEYXRlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2NvcGUuJHdhdGNoKCdjbG9jay5faG91cnMnLCB2YWwgPT4ge1xyXG4gICAgICAgICAgaWYgKCh2YWwgIT0gbnVsbCkgJiYgIWlzTmFOKHZhbCkpIHtcclxuICAgICAgICAgICAgaWYgKCFzY29wZS5faG91cnMyNCkge1xyXG4gICAgICAgICAgICAgIGlmICh2YWwgPT09IDI0KSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSAxMjtcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gMTIpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IDA7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2NvcGUuY2xvY2suaXNBTSgpKSB7IHZhbCArPSAxMjsgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodmFsICE9PSBzY29wZS5kYXRlLmdldEhvdXJzKCkpIHtcclxuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldEhvdXJzKHZhbCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnNhdmVVcGRhdGVEYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2NvcGUuc2V0Tm93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgc2NvcGUuc2V0RGF0ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLnNhdmVVcGRhdGVEYXRlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUubW9kZUNsYXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgaWYgKHNjb3BlLl9kaXNwbGF5TW9kZSAhPSBudWxsKSB7IHNjb3BlLl9tb2RlID0gc2NvcGUuX2Rpc3BsYXlNb2RlOyB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGAke3Njb3BlLl92ZXJ0aWNhbE1vZGUgPyAndmVydGljYWwgJyA6ICcnfSR7XHJcbiAgICAgICAgc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZnVsbCcgPyAnZnVsbC1tb2RlJ1xyXG4gICAgICAgIDogc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAndGltZScgPyAndGltZS1vbmx5J1xyXG4gICAgICAgIDogc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZGF0ZScgPyAnZGF0ZS1vbmx5J1xyXG4gICAgICAgIDogc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW1vZGUnXHJcbiAgICAgICAgOiAndGltZS1tb2RlJ30gJHtzY29wZS5fY29tcGFjdCA/ICdjb21wYWN0JyA6ICcnfWA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUubW9kZVN3aXRjaCA9ICgpID0+IHNjb3BlLl9tb2RlID0gc2NvcGUuX2Rpc3BsYXlNb2RlICE9IG51bGwgPyBzY29wZS5fZGlzcGxheU1vZGUgOiBzY29wZS5fbW9kZSA9PT0gJ2RhdGUnID8gJ3RpbWUnIDogJ2RhdGUnO1xyXG4gICAgICAgIHJldHVybiBzY29wZS5tb2RlU3dpdGNoVGV4dCA9ICgpID0+IGAke3NjRGF0ZVRpbWVJMThuLnN3aXRjaFRvfSAke1xyXG4gICAgICAgIHNjb3BlLl9tb2RlID09PSAnZGF0ZScgPyBzY0RhdGVUaW1lSTE4bi5jbG9jayA6IHNjRGF0ZVRpbWVJMThuLmNhbGVuZGFyfWA7XHJcbiAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG4gIH0sXHJcbl0pO1xyXG4iXX0=
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-bootstrap.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><button type="button" ng-click="calendar._incMonth(-1)" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-left"></i></button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"> <button type="button" ng-click="calendar._incMonth(1)" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-right"></i></button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" class="btn btn-link day-cell">1</button> <button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" class="btn btn-link day-cell">2</button> <button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" class="btn btn-link day-cell">3</button> <button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" class="btn btn-link day-cell">4</button> <button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" class="btn btn-link day-cell">5</button> <button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" class="btn btn-link day-cell">6</button> <button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" class="btn btn-link day-cell">7</button> <button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" class="btn btn-link day-cell">8</button> <button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" class="btn btn-link day-cell">9</button> <button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" class="btn btn-link day-cell">10</button> <button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" class="btn btn-link day-cell">11</button> <button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" class="btn btn-link day-cell">12</button> <button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" class="btn btn-link day-cell">13</button> <button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" class="btn btn-link day-cell">14</button> <button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" class="btn btn-link day-cell">15</button> <button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" class="btn btn-link day-cell">16</button> <button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" class="btn btn-link day-cell">17</button> <button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" class="btn btn-link day-cell">18</button> <button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" class="btn btn-link day-cell">19</button> <button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" class="btn btn-link day-cell">20</button> <button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" class="btn btn-link day-cell">21</button> <button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" class="btn btn-link day-cell">22</button> <button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" class="btn btn-link day-cell">23</button> <button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" class="btn btn-link day-cell">24</button> <button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" class="btn btn-link day-cell">25</button> <button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" class="btn btn-link day-cell">26</button> <button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" class="btn btn-link day-cell">27</button> <button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" class="btn btn-link day-cell">28</button> <button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" class="btn btn-link day-cell">29</button> <button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" class="btn btn-link day-cell">30</button> <button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" class="btn btn-link day-cell">31</button></div></div><button type="button" ng-click="modeSwitch()" class="btn btn-link switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"> <button type="button" ng-click="clock._incHours(1)" class="btn btn-link hours up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incHours(-1)" class="btn btn-link hours down"><i class="fa fa-caret-down"></i></button> <input type="text" ng-model="clock._minutes"> <button type="button" ng-click="clock._incMinutes(1)" class="btn btn-link minutes up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incMinutes(-1)" class="btn btn-link minutes down"><i class="fa fa-caret-down"></i></button></div><div ng-if="!_hours24" class="buttons"><button type="button" ng-click="clock.setAM()" class="btn btn-link">{{date | date:\'a\'}}</button></div></div></div></div><div class="buttons"><button type="button" ng-click="setNow()" class="btn btn-link">{{:: translations.now}}</button> <button type="button" ng-click="cancel()" ng-if="!autosave" class="btn btn-link">{{:: translations.cancel}}</button> <button type="button" ng-click="save()" ng-if="!autosave" class="btn btn-link">{{:: translations.save}}</button></div></div>');

}]);
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-material.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><md-button type="button" ng-click="calendar._incMonth(-1)" aria-label="{{:: translations.previousMonth}}" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}"><i class="fa fa-caret-left"></i></md-button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"><md-button type="button" ng-click="calendar._incMonth(1)" aria-label="{{:: translations.nextMonth}}" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}"><i class="fa fa-caret-right"></i></md-button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><md-button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" aria-label="1" class="day-cell">1</md-button><md-button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" aria-label="2" class="day-cell">2</md-button><md-button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" aria-label="3" class="day-cell">3</md-button><md-button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" aria-label="4" class="day-cell">4</md-button><md-button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" aria-label="5" class="day-cell">5</md-button><md-button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" aria-label="6" class="day-cell">6</md-button><md-button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" aria-label="7" class="day-cell">7</md-button><md-button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" aria-label="8" class="day-cell">8</md-button><md-button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" aria-label="9" class="day-cell">9</md-button><md-button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" aria-label="10" class="day-cell">10</md-button><md-button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" aria-label="11" class="day-cell">11</md-button><md-button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" aria-label="12" class="day-cell">12</md-button><md-button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" aria-label="13" class="day-cell">13</md-button><md-button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" aria-label="14" class="day-cell">14</md-button><md-button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" aria-label="15" class="day-cell">15</md-button><md-button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" aria-label="16" class="day-cell">16</md-button><md-button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" aria-label="17" class="day-cell">17</md-button><md-button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" aria-label="18" class="day-cell">18</md-button><md-button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" aria-label="19" class="day-cell">19</md-button><md-button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" aria-label="20" class="day-cell">20</md-button><md-button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" aria-label="21" class="day-cell">21</md-button><md-button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" aria-label="22" class="day-cell">22</md-button><md-button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" aria-label="23" class="day-cell">23</md-button><md-button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" aria-label="24" class="day-cell">24</md-button><md-button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" aria-label="25" class="day-cell">25</md-button><md-button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" aria-label="26" class="day-cell">26</md-button><md-button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" aria-label="27" class="day-cell">27</md-button><md-button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" aria-label="28" class="day-cell">28</md-button><md-button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" aria-label="29" class="day-cell">29</md-button><md-button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" aria-label="30" class="day-cell">30</md-button><md-button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" aria-label="31" class="day-cell">31</md-button></div></div><md-button type="button" ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></md-button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"><md-button type="button" ng-click="clock._incHours(1)" aria-label="{{:: translations.incrementHours}}" class="hours up"><!--i.fa.fa-caret-up--><md-icon>arrow_drop_up</md-icon></md-button><md-button type="button" ng-click="clock._incHours(-1)" aria-label="{{:: translations.decrementHours}}" class="hours down"><!--i.fa.fa-caret-down--><md-icon>arrow_drop_down</md-icon></md-button><input type="number" ng-model="clock._minutes"><md-button type="button" ng-click="clock._incMinutes(1)" aria-label="{{:: translations.incrementMinutes}}" class="minutes up"><!--i.fa.fa-caret-up--><md-icon>arrow_drop_up</md-icon></md-button><md-button type="button" ng-click="clock._incMinutes(-1)" aria-label="{{:: translations.decrementMinutes}}" class="minutes down"><!--i.fa.fa-caret-down--><md-icon>arrow_drop_down</md-icon></md-button></div><div ng-if="!_hours24" class="buttons"><md-button type="button" ng-click="clock.setAM()" aria-label="{{:: translations.switchAmPm}}">{{date | date:\'a\'}}</md-button></div></div></div></div><div class="buttons"><md-button type="button" ng-click="setNow()" aria-label="{{:: translations.now}}">{{:: translations.now}}</md-button><md-button type="button" ng-click="cancel()" ng-if="!autosave" aria-label="{{:: translations.cancel}}">{{:: translations.cancel}}</md-button><md-button type="button" ng-click="save()" ng-if="!autosave" aria-label="{{:: translations.save}}">{{:: translations.save}}</md-button></div></div>');

}]);