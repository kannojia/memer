/**
*  Memerjs : Simple Javascript library to generate memes
*/

(function() {

    /**
    * Memer : Constructor function
    * @public
    * @desc Creates a new Memer instance exposing functions which can be used to
    *       create and manipulate memes
    * @param {String | Object | HTMLCanvasElement} canvas - Reference to canvas element
    *        which will be used to draw the meme. It can be either CSS Selector
    *        Expression, jQuery Object or reference to native HTMLCanvasElement
    * @return {Object} MemerInstance - Instance of the Memer constructor
    */
    var Memer = function(canvas) {
        if(typeof canvas === 'string') {
            this.canvas = document.querySelector(canvas);
        } else if(($) && canvas instanceof $) {
            this.canvas = $(canvas).get(0);
        } else if(canvas instanceof HTMLCanvasElement) {
            this.canvas = canvas;
        } else {
            throw new TypeError("Parameter is not valid Canvas element!");
        }

        // If canvas' width and height are specified in HTML then use those
        this.canvasWidth = this.canvas.getAttribute('width');
        this.canvasHeight = this.canvas.getAttribute('height');

        this.baseFontSize = 48;
    };

    /**
    * setImage : Prototype function
    * @public
    * @desc Sets the image on canvas which will be used as the base image for
    *       generating meme. Aditionally handles the sizing of canvas and image
    * @param {String | Object | HTMLImageElement} image - Reference to the image,
    *        It can be the path to the image file (absolute or relative), jQuery
    *        image object, or native HTMLImageElement
    * @return void
    */
    Memer.prototype.setImage = function(image) {
        var self = this;
        // Check the image type
        if(typeof image === 'string') {
            if(image === '') {
                throw new TypeError("Parameter is not valid Image element!");
            }
            self.image = document.createElement('img');
            self.image.src = image;
        } else if(($) && image instanceof $) {
            self.image = $(image).get(0);
        } else if(image instanceof HTMLImageElement) {
            self.image = image;
        } else {
            throw new TypeError("Parameter is not valid Image element!");
        }

        // Set crossOrigin attribute on image element to enable CORS image request
        self.image.setAttribute('crossOrigin', 'anonymous');

        // If image is already loaded then process it otherwise wait for the image to load
        if(self.image.complete && self.image.naturalWidth > 0) {
            resizeCanvas();
        } else {
            self.image.onload = function() {
                resizeCanvas();
            };
        }


        /**
        * resizeCanvas : Local function
        * @private
        * @desc Resizes the canvas or image according to following condition:
        *       If canvas width and height are specified, resize the image to
        *       fill the canvas, otherwise resize the canvas to the image size.
        *       And trigger 'onImageLoad' event
        * @return void
        */

        function resizeCanvas() {
            if(self.canvasWidth && self.canvasHeight) {
                self.image.width = self.canvasWidth;
                self.image.height = self.canvasHeight;
            } else {
                self.canvas.width = self.image.width;
                self.canvas.height = self.image.height;
            }

            // Trigger onImageLoad event
            self.trigger('onImageLoad');
        }
    };


    /**
    * renderImage : Prototype function
    * @public
    * @desc Renders the text provided onto the base meme image set by setImage()
    *       Additionally handles the multiline text and font resizing to fit the
    *       text in image.
    * @param {String} topText - Text which will be rendered on top position of Meme
    * @param {String} bottomText - Text which will be rendered on bottom
    *
    * @return void
    */
    Memer.prototype.renderImage = function(topText, bottomText) {
        var self = this;

        var ctx = self.canvas.getContext('2d');
        ctx.drawImage(self.image, 0, 0, self.image.width, self.image.height);

        topText = topText || '';
        bottomText = bottomText || '';

        drawText(topText, 'top');
        drawText(bottomText, 'bottom');


        /**
        * drawText : Local function
        * @private
        * @desc Handles the drawing logics like, text coordinates, fontsize,
        *       drawing positions and finally calls the actual text rendering
        *       function
        * @param {String} text - Text which needs to be rendered on canvas
        * @param {String} position - 'top' or 'bottom' - Positions where the text
        *        will be rendered
        * @param {Number} y - y coordinate where the text will be placed
        * @param {Number} fontsize - fontsize in which the text will be rendered
        * @return void
        */
        function drawText(text, position, y, fontsize) {
            var ctx = self.canvas.getContext('2d');

            if(!fontsize) {
                fontsize = self.baseFontSize;
            }

            var x = self.canvas.width / 2;
            if(!y) {
                if(position === 'top')  {
                    y = fontsize;
                } else if(position === 'bottom') {
                    y = self.canvas.height - 10; // 10 is offset from bottom
                }
            }

            // If new lines "\n" are present in text handle them
            var lines = text.split('\n');
            var lineheight = fontsize + 10;

            // Check if it is top draw position, then start from first line, otherwise
            // we'll draw last line first
            if(position === 'top') {
                for(var i=0; i<lines.length; i++) {
                    // Check if we need to resize to fonts to fit the text and recalculate the lineheight
                    if(ctx.measureText(lines[i]).width > self.canvas.width * 1.1) {
                        fontsize = Math.floor(((self.canvas.width * 1.1) / ctx.measureText(lines[i]).width) * fontsize);
                        lineheight = fontsize + 10;
                    }
                    fillTextOnCanvas(lines[i], x, y + (i * lineheight), fontsize);
                }
            } else if(position === 'bottom') {
                for(var i=lines.length-1; i>=0; i--) {
                    // Check if we need to resize to fonts to fit the text and recalculate the lineheight
                    if(ctx.measureText(lines[i]).width > self.canvas.width * 1.1) {
                        fontsize = Math.floor(((self.canvas.width * 1.1) / ctx.measureText(lines[i]).width) * fontsize);
                        lineheight = fontsize + 10;
                    }
                    fillTextOnCanvas(lines[i], x, y - ((lines.length - i - 1) * lineheight), fontsize);
                }
            }

            // Rendering is done, Trigger afterRender Event
            self.trigger('afterRender');
        }

        /**
        * fillTextOnCanvas : Local function
        * @private
        * @desc Draws the text on canvas using specified parameters.
        * @param {String}  text - Text which will be stroked on canvas
        * @param {Number} x - x coordinate position from where drawing will start
        * @param {Number} y - y coordinate position from where drawing will start
        * @param {Number} fontsize - fontsize which will be used to draw text
        * @return void
        */
        function fillTextOnCanvas(text, x, y, fontsize) {
            ctx.textAlign = "center";
            ctx.font = " "+fontsize+"px Impact";
            ctx.fillStyle = "#FFF";
            ctx.strokeStyle = "#000";
            ctx.shadowColor = "#000";
            ctx.shadowBlur = 3;
            ctx.lineWidth = 3;
            ctx.fillText(text, x , y, self.canvas.width * 0.9);
            ctx.strokeText(text, x, y, self.canvas.width * 0.9);

            // Drawing text twice to get more prominent text effect
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#FFF";
            ctx.shadowBlur = 0;
            ctx.fillText(text, x , y, self.canvas.width * 0.9);
        }
    };


    /**
    * getDataURL : Prototype function
    * @public
    * @desc Returns the base64 encoded dataURL of the rendered meme
    * @return {String} dataURL - base64 encoded image dataURL
    */
    Memer.prototype.getDataURL = function() {
        return this.canvas.toDataURL();
    };


    /**
    * Event Interface for Memer Objects
    * @desc Three methods:
    *       .on() - To subscribe to an event, takes eventName and callback as
    *               parameters and optional this value which will be used while
    *               executing callback
    *       .off() - Unsubscribe from Event, takes eventObj as param which was
    *                returned when the event was subscribed
    *       .trigger() - Fires the event specified by eventName parameter
    */
    Memer.EventBus = {};
    Memer.prototype.on = function(key, callback, context) {
        Memer.EventBus[key] = Memer.EventBus[key] || [];
        var uuid = Memer.Util.getUUID();
        Memer.EventBus[key].push({
            'uuid' : uuid,
            'key' : key,
            'callback' : callback.bind(context)
        });

        return {
            'uuid' : uuid,
            'key' : key
        };
    };

    Memer.prototype.off = function(eventObj) {
        for(var i=0; i<Memer.EventBus[eventObj.key].length; i++) {
            var listener = Memer.EventBus[eventObj.key][i];
            if(listener.uuid === eventObj.uuid) {
                listener = undefined;
                Memer.EventBus[eventObj.key].splice(i, 1);
                return;
            }
        }
    };

    Memer.prototype.trigger = function(key) {
        if(!Memer.EventBus[key]) { return; }
        for(var i=0; i < Memer.EventBus[key].length; i++) {
            Memer.EventBus[key][i].callback();
        }
    };

    // Utility functions
    Memer.Util = {
        'getUUID' : function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
    };


    window.Memer = Memer;

})();
