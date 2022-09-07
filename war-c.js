function WarC(opts) {

    return new (function(opts) {
    
        const DIR_UP = 38;
        const DIR_RIGHT = 39;
        const DIR_DOWN = 40;
        const DIR_LEFT = 37;
        const metric = { left: 'width', top: 'height'};
        const _this = this;

        _this.move_wrapper = function (e) {
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

            var $_curr, $curr = $('.'+_this.options.activeClass).length == 0 ? document.activeElement : $('.'+_this.options.activeClass);
            if (_this.debug >= 1) console.log('CURR', $curr)
            
            var c_pos = $curr.offset();

            var $nearest;
            var n_dist = 1000000000;
            var loop = false;
            
            _this.lastElement = _this.lastElement || $curr[0];
            
            while (true) {
            
                $(_this.options.selector).each(function() {                
                    this.factor = this.factor || 1;
                    
                    if (this == $curr[0] || ($_curr && this == $_curr[0])) return true;
                    
                    if (sign*$(this).offset()[prop] > sign*c_pos[prop]) {
                        var dist = distanceElements(this, loop ? $_curr : $curr);
                        var deg = Math.abs( angle_fix - Math.abs(angle(this, loop ? $_curr : $curr)) );
                        dist = (dist + dist * deg/90 * _this.options.anglePenalty) * this.factor;
                        if (_this.debug >= 2) console.log('   TESTING', this, dist);
                        if (dist < n_dist) {
                            $nearest = $(this);
                            n_dist = dist;
                        }            
                    }
                });

                if (!$nearest && _this.options.loopEnabled) {
                    if (_this.debug >= 1) console.log('LOOP')
                    c_pos[prop] = c_pos[prop] - sign * $(document.body)[metric[prop]]();
                    $_curr = $curr.clone(true);
                    $_curr[0].style.position = 'fixed';
                    $_curr[0].style.width = $curr.width() + 'px';
                    $_curr[0].style.height = $curr.height() +  'px';
                    $_curr[0].style[prop] = c_pos[prop] + 'px';
                    $_curr[0].style[prop == 'left' ? 'top' : 'left'] = c_pos[prop == 'left' ? 'top' : 'left'] + 'px';
                    $_curr.appendTo(document.body);
                    loop = true;
                } else {
                    break;
                }
            
            }
                
            if (_this.debug >= 1) console.log('NEAREST', $nearest)
            
            if ($nearest) {
                if ($_curr) $_curr.remove();
                _this.lastElement.factor = 1;
                _this.lastElement = $curr[0];
                _this.lastElement.factor = _this.options.remember ? 0.5 : 1;
                _this.selectElement($nearest);
            }
            
        };
        
        _this.selectElement = function(e) {
            $('.'+_this.options.activeClass).removeClass(_this.options.activeClass);
            $(e).addClass(_this.options.activeClass).focus()
        }
        
        // Library ////////////////////////////////////////////////////////////////////////
        
        function angle(e1, e2) {
            var [ p1, p2 ] = [ $(e1).offset(), $(e2).offset() ];
            return Math.atan2(p1.top - p2.top, p1.left - p2.left) * 180 / Math.PI;
        };
        
        function distanceElements(e1, e2) {
            var [ $e1, $e2 ] = [ $(e1), $(e2) ];
            var pos, size = {};
            pos = $e1.offset();
            [ size.width, size.height ] = [ $e1.width(), $e1.height() ];
            var p1 = [ 
                { left: pos.left, top: pos.top }, // top left
                { left: pos.left + size.width, top: pos.top }, // top right
                { left: pos.left + size.width, top: pos.top + size.height }, // bottom right
                { left: pos.left , top: pos.top + size.height } // bottom left
            ];

            pos = $e2.offset();
            [ size.width, size.height ] = [ $e2.width(), $e2.height() ];
            var p2 = [ 
                { left: pos.left, top: pos.top }, // top left
                { left: pos.left + size.width, top: pos.top }, // top right
                { left: pos.left + size.width, top: pos.top + size.height }, // bottom right
                { left: pos.left, top: pos.top + size.height } // bottom left
            ];
            
            return Math.min( ...p1.map( (p) =>  Math.min(...[0,1,2,3].map( i => distancePoints(p, p2[i]) )) ) );
        };
        
        function distancePoints(p1, p2) {
            return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
        };
        
        function classExists(c) {
            return !!Object.values(document.styleSheets).filter(s => { try { return s.rules } catch(e) { return false;} }  ).map( c => !!Math.max(...Object.values(c.cssRules).map( r => r.selectorText == '.'+c)  )).filter(c => c).length;
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        opts = opts || {};
        _this.options = {
            activeClass: '--ac-active',
            selector: 'button:visible, input[type="button"]:visible, a:visible',
            anglePenalty: 1,
            loopEnabled: false,
            remember: true,
            clickResponsive: true,
            debug: 0
        };

        $.extend(_this.options, opts);
        
        document.removeEventListener("keydown", _this.move_wrapper);
        document.addEventListener("keydown", _this.move_wrapper);
        
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
        
        if (_this.options.clickResponsive) {
            $(_this.options.selector).click( e => _this.selectElement(e.target) );
        }
        
        _this.options.initialElement = _this.options.initialElement || $(_this.options.selector)[0];
        _this.selectElement(_this.options.initialElement);
        
        _this.debug = _this.options.debug;

        return _this;

    })(opts);
};
