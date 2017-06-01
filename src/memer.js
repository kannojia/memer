/**
*  Memerjs
*/

var Memer = function(canvas) {
    // Check if canvas is selector, jquery object, or native HTMLCanvasElement
    if(typeof canvas === 'string') {
        this.canvas = document.querySelector(canvas);
    } else if(($) && canvas instanceof $) {
        this.canvas = $(canvas).get(0);
    } else if(canvas instanceof HTMLCanvasElement) {
        this.canvas = canvas;
    } else {
        throw new TypeError("Parameter is not valid Canvas element!");
    }

    this.baseFontSize = 48;
};

/* Takes image path, or jquery image object or native HTMLImageElement */
Memer.prototype.setImage = function(image) {
    var self = this;
    // Check the image type
    if(typeof image === 'string') {
        self.image = document.createElement('img');
        self.image.src = image;
    } else if(($) && image instanceof $) {
        self.image = $(image).get(0);
    } else if(image instanceof HTMLImageElement) {
        self.image = image;
    } else {
        throw new TypeError("Parameter is not valid Image element!");
    }

    // Set the canvas width and height on image load
    self.image.onload = function() {
        self.canvas.width = self.image.width;
        self.canvas.height = self.image.height;

        // Trigger onImageLoad event
        self.trigger('onImageLoad');
    };
};

Memer.prototype.renderImage = function(topText, bottomText) {
    var self = this;

    var ctx = self.canvas.getContext('2d');
    ctx.drawImage(self.image, 0, 0);

    // Draw Texts
    topText = topText || '';
    bottomText = bottomText || '';

    drawText(topText, 'top');
    drawText(bottomText, 'bottom');


    // Private Method
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

        // Check if we need to resize to fonts to fit the text
        if(ctx.measureText(text).width > self.canvas.width * 1.1) {
            fontsize = Math.floor(((self.canvas.width * 1.1) / ctx.measureText(text).width) * fontsize);
        }

        ctx.textAlign = "center";
        ctx.font = " "+fontsize+"px Impact";
        ctx.fillStyle = "#FFF";

        ctx.strokeStyle = "#000";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 3;
        ctx.lineWidth = 3;
        ctx.fillText(text, x , y, self.canvas.width * 0.9);
        ctx.strokeText(text, x, y, self.canvas.width * 0.9);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FFF";
        ctx.shadowBlur = 0;
        ctx.fillText(text, x , y, self.canvas.width * 0.9);

        // Trigger memeRendered Event
        self.trigger('onRender');
    }
};


// Event Interface
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
