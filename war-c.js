function WarC(opts) {

    return new (function(opts) {

        const DIR_UP = 38;
        const DIR_RIGHT = 39;
        const DIR_DOWN = 40;
        const DIR_LEFT = 37;
        const ENTER = 13;

        const metric = { left: 'Width', top: 'Height'};

        const _this = this;

        _this.move_wrapper = function (e) {
            if (e.keyCode == ENTER) {
                if (_this.options.enterTriggerClick) {
                    e.stopPropagation();
                    e.preventDefault();
                    $(_this.activeElement).click()
                }
                return;
            }
            _this.move(e.keyCode);
        };

        _this.move = function(dir) {
            if (![ DIR_RIGHT, DIR_LEFT, DIR_UP, DIR_DOWN ].includes(dir)) return;
            if (dir == DIR_UP) {
                var [ prop, sign, angle_fix ] = [ 'top', -1, 90 ];
            } else if (dir == DIR_RIGHT) {
                var [ prop, sign, angle_fix ] = [ 'left', 1, 0 ];
            } else if (dir == DIR_DOWN) {
                var [ prop, sign, angle_fix ] = [ 'top', 1, 90 ];
            } else if (dir == DIR_LEFT) {
                var [ prop, sign, angle_fix ] = [ 'left', -1, 180 ];
            }

            var $_curr;
            var $curr = document.querySelectorAll('.'+_this.options.activeClass).length == 0
                ? document.activeElement
                : document.querySelector('.'+_this.options.activeClass);
            if (_this.debug >= 1) console.log('CURR', $curr)

            var c_pos = offset($curr);

            var $nearest;
            var n_dist = 1000000000;
            var loop = false;

            _this.lastElement = _this.lastElement || $curr;

            while (true) {
                document.querySelectorAll(_this.options.selector).forEach(th => {
                    th.factor = th.factor || 1;

                    if (th == $curr || ($_curr && th == $_curr)) return true;

                    if (sign * offset(th)[prop] > sign * c_pos[prop]) {
                        var dist = distanceElements(th, loop ? $_curr : $curr);
                        var deg =
                            Math.abs( angle_fix - Math.abs(angle(th, loop ? $_curr : $curr)) );
                        dist = (dist + dist * deg/90 * _this.options.anglePenalty) * th.factor;
                        if (_this.debug >= 2) console.log('   TESTING', th, dist);
                        if (dist < n_dist) {
                            $nearest = th;
                            n_dist = dist;
                        }
                    }
                });

                if (!$nearest && _this.options.loopEnabled) {
                    if (_this.debug >= 1) console.log('LOOP')
                    c_pos[prop] = c_pos[prop] - sign * document.body['client'+metric[prop]];
                    $_curr = $curr.cloneNode(true);
                    $_curr.style.position = 'fixed';
                    $_curr.style.width = $curr.clientWidth + 'px';
                    $_curr.style.height = $curr.clientHeight +  'px';
                    $_curr.style[prop] = c_pos[prop] + 'px';
                    $_curr.style[prop == 'left' ? 'top' : 'left'] =
                        c_pos[prop == 'left' ? 'top' : 'left'] + 'px';
                    document.body.appendChild($_curr);
                    loop = true;
                } else {
                    break;
                }
            }

            if (_this.debug >= 1) console.log('NEAREST', $nearest)

            if ($nearest) {
                if ($_curr) $_curr.remove();
                _this.lastElement.factor = 1;
                _this.lastElement = $curr;
                _this.lastElement.factor = _this.options.remember ? 0.1 : 1;
                _this.selectElement($nearest);
            }

        };

        _this.selectElement = function(e) {
            (
                a = document.querySelector('.'+_this.options.activeClass),
                a && a.classList.remove(_this.options.activeClass)
            );
            e.classList.add(_this.options.activeClass);
            e.focus();
            _this.activeElement = e;
        }

        _this.enable = function() {
            document.removeEventListener("keydown", _this.move_wrapper);
            document.addEventListener("keydown", _this.move_wrapper);
        };

        _this.disable = function() {
            document.removeEventListener("keydown", _this.move_wrapper);
        };

        // Library ////////////////////////////////////////////////////////////////////////

        function angle(e1, e2) {
            var [ p1, p2 ] = [ offset(e1), offset(e2) ];
            return Math.atan2(p1.top - p2.top, p1.left - p2.left) * 180 / Math.PI;
        };

        function distanceElements(e1, e2) {
            var pos, size = {};
            pos = offset(e1);
            [ size.width, size.height ] = [ pos.width, pos.height ];
            var p1 = [
                { left: pos.left, top: pos.top }, // top left
                { left: pos.left + size.width, top: pos.top }, // top right
                { left: pos.left + size.width, top: pos.top + size.height }, // bottom right
                { left: pos.left , top: pos.top + size.height } // bottom left
            ];

            pos = offset(e2);
            [ size.width, size.height ] = [ pos.width, pos.height ];
            var p2 = [
                { left: pos.left, top: pos.top }, // top left
                { left: pos.left + size.width, top: pos.top }, // top right
                { left: pos.left + size.width, top: pos.top + size.height }, // bottom right
                { left: pos.left, top: pos.top + size.height } // bottom left
            ];

            return Math.min( ...p1.map(
                (p) =>  Math.min(...[0,1,2,3].map( i => distancePoints(p, p2[i]) ))
            ));
        };

        function distancePoints(p1, p2) {
            return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
        };

        function classExists(c) {
            return !!Object.values(document.styleSheets).filter(s => { try { return s.rules } catch(e) { return false;} }  ).map( c => !!Math.max(...Object.values(c.cssRules).map( r => r.selectorText == '.'+c)  )).filter(c => c).length;
        }

        function offset(e) {            
            return JSON.parse(JSON.stringify(e.getBoundingClientRect()));
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////

        opts = opts || {};
        _this.options = {
            activeClass: '--ac-active',
            selector: 'button, input[type="button"], a',
            anglePenalty: 1,
            loopEnabled: false,
            remember: true,
            allowMouseSelect: true,
            enterTriggerClick: true,
            debug: 0
        };

        _this.options = {..._this.options, ...opts};

        if (!classExists(_this.options.activeClass)) {
            document.head.innerHTML += `
            <style>
            .--ac-active {
                background-color: red;
                color: white;
            }
            </style>
            `;
        }

        if (_this.options.allowMouseSelect) {
            document.querySelector(_this.options.selector)
                .click( e => _this.selectElement(e.target) );
        }

        _this.options.initialElement =
            _this.options.initialElement || document.querySelector(_this.options.selector);
        _this.selectElement(_this.options.initialElement);

        _this.debug = _this.options.debug;

        _this.enable();

        return _this;

    })(opts);
};
