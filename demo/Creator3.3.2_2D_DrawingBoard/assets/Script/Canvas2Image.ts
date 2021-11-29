
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Canvas2Image')
export class Canvas2Image {
    public static getInstance () {
        // check if support sth.
        var $support = function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            return {
                canvas: !!ctx,
                imageData: !!ctx.getImageData,
                dataURL: !!canvas.toDataURL,
                btoa: !!window.btoa
            };
        }();

        var downloadMime = 'image/octet-stream';
        function scaleCanvas (canvas: CanvasImageSource, width: number, height: number) {
            var w = canvas.width as number;
            var h = canvas.height as number;
            if (width == undefined) {
                width = w;
            }
            if (height == undefined) {
                height = h;
            }

            var retCanvas = document.createElement('canvas');
            var retCtx = retCanvas.getContext('2d');
            retCanvas.width = width;
            retCanvas.height = height;
            retCtx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
            return retCanvas;
        }

        function getDataURL (canvas: CanvasImageSource, type: any, width: number, height: number) {
            canvas = scaleCanvas(canvas, width, height);
            return canvas.toDataURL(type);
        }

        function saveFile (strData: string, type: any, fileName: any) {
            fileDownload(strData, type, fileName);
        }

        function genImage (strData: string) {
            var img = document.createElement('img');
            img.src = strData;
            return img;
        }

        function fixType (type: string) {
            type = type.toLowerCase().replace(/jpg/i, 'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        }

        function encodeData (data: string | any[]) {
            if (!window.btoa) {
                throw 'btoa undefined';
            }
            var str = '';
            if (typeof data == 'string') {
                str = data;
            } else {
                for (var i = 0; i < data.length; i++) {
                    str += String.fromCharCode(data[i]);
                }
            }

            return btoa(str);
        }

        function getImageData (canvas: HTMLCanvasElement) {
            var w = canvas.width;
            var h = canvas.height;
            return canvas.getContext('2d').getImageData(0, 0, w, h);
        }

        function makeURI (strData: string, type: string) {
            return 'data:' + type + ';base64,' + strData;
        }

        // 按照规则生成bitmap图片响应头和响应体
        var genBitmapImage = function (oData: ImageData) {
            // BITMAPFILEHEADER: http://msdn.microsoft.com/en-us/library/windows/desktop/dd183374(v=vs.85).aspx
            // BITMAPINFOHEADER: http://msdn.microsoft.com/en-us/library/dd183376.aspx
            
            var biWidth = oData.width;
            var biHeight = oData.height;
            var biSizeImage = biWidth * biHeight * 3;
            var bfSize = biSizeImage + 54; // total header size = 54 bytes

            //  typedef struct tagBITMAPFILEHEADER {
            //  	WORD bfType;
            //  	DWORD bfSize;
            //  	WORD bfReserved1;
            //  	WORD bfReserved2;
            //  	DWORD bfOffBits;
            //  } BITMAPFILEHEADER;

            var BITMAPFILEHEADER = [
                // WORD bfType -- The file type signature; must be "BM"
                0x42, 0x4D,
                // DWORD bfType -- The size, in bytes, of the bitmap file
                bfSize & 0xff, bfSize >> 8 & 0xff, bfSize >> 16 & 0xff, bfSize >> 24 & 0xff,
                // WORD bfReserved1 -- Reserved; must be zero
                0, 0,
                // WORD bfReserved2 -- Reserved; must be zero
                0, 0,
                // DWORD bfOffBits -- The offset, in bytes, from the beginning of the BITMAPFILEHEADER Structure to the bitmap bits.
                54, 0, 0, 0
            ];

            //  typedef struct tagBITMAPINFOHEADER {
            //  	DWORD biSize;
            //  	LONG  biWidth;
            //  	LONG  biHeight;
            //  	WORD  biPlanes;
            //  	WORD  biBitCount;
            //  	DWORD biCompression;
            //  	DWORD biSizeImage;
            //  	LONG  biXPelsPerMeter;
            //  	LONG  biYPelsPerMeter;
            //  	DWORD biClrUsed;
            //  	DWORD biClrImportant;
            //  } BITMAPINFOHEADER, *PBITMAPINFOHEADER;

            var BITMAPINFOHEADER = [
                // DWORD biSize -- The number of bytes require by the structure
                40, 0, 0, 0,
                // LONG biWidth -- The width of the bitmap, in pixels
                biWidth & 0xff, biWidth >> 8 & 0xff, biWidth >> 16 & 0xff, biWidth >> 24 & 0xff,
                // LONG biHeight -- The height of the bitmap, in pixels
                biHeight & 0xff, biHeight >> 8 & 0xff, biHeight >> 16 & 0xff, biHeight >> 24 & 0xff,
                // WORD biPlanes -- The number of planes for the target deviecs. The value must be set to 1
                1, 0,
                // Word biBitCount -- The number of bits-per-pixel, 24 bits-per-pixel
                // the bitmap has a maximun of 2^24 colors (16777216, Truecolor)
                24, 0,
                // DWORD biCompression -- the type of compression, BI_RGB (code 0) -- uncompressed
                0, 0, 0, 0,
                // DWORD biSizeImage -- The size, in bytes, of the image. This may be set to zero for BI_REG bitmaps
                biSizeImage & 0xff, biSizeImage >> 8 & 0xff, biSizeImage >> 16 & 0xff, biSizeImage >> 24 & 0xff,
                // LONG biXPelsPerMeter, unused
                0, 0, 0, 0,
                // LONG biYPelsPerMeter, unused
                0, 0, 0, 0,
                // DWORD biClrUsed, the number of color indexes of palette, unused
                0, 0, 0, 0,
                // DWORD biClrImportant, unused
                0, 0, 0, 0
            ];

            var iPadding = (4 - ((biWidth * 3) % 4)) % 4;
            var aImageData = oData.data;
            var strPixelData = "";
            var biWidth4 = biWidth << 2;
            var y = biHeight;
            var fromCharCode = String.fromCharCode;

            do {
                var iOffsetY = biWidth4 * (y - 1);
                var strPixelRow = "";
                for (var x = 0; x < biWidth; x++) {
                    var iOffsetX = x << 2;
                    strPixelRow += fromCharCode(aImageData[iOffsetY + iOffsetX + 2]) + fromCharCode(aImageData[iOffsetY + iOffsetX + 1]) + fromCharCode(aImageData[iOffsetY + iOffsetX]);
                }

                for (var c = 0; c < iPadding; c++) {
                    strPixelRow += String.fromCharCode(0);
                }

                strPixelData += strPixelRow;
            } while (--y);

            var strEncoded = encodeData(BITMAPFILEHEADER.concat(BITMAPINFOHEADER)) + encodeData(strPixelData);
            return strEncoded;
        }

        var saveAsImage = function (canvas: any, width: number, height: number, type: string, fileName: string) {
            /**
             * canvas.toBlob 的第三个参数。当请求图片格式为image/jpeg或者image/webp时用来指定图片展示质量。
             * 如果这个参数的值不在指定类型与范围之内，则使用默认值，其余参数将被忽略。
             * 此处暂时默认设置为 1
             */
            var quality = 1.0;
            if ($support.canvas && $support.dataURL) {
                if (typeof canvas == "string") { canvas = document.getElementById(canvas); }
                if (type == undefined) { type = 'png'; }
                type = fixType(type);
                if (/bmp/.test(type)) {
                    var data = getImageData(scaleCanvas(canvas, width, height));
                    var strData = genBitmapImage(data);
                    saveFile(makeURI(strData, downloadMime), type.replace("image/", ""), fileName);
                } else {
                    
                    canvas = scaleCanvas(canvas, width, height);
                    // 如果
                    canvas.toBlob(function(blob){
                        var url = URL.createObjectURL(blob);
                        saveFile(url, type.replace("image/", ""), fileName);
                    }, type, quality)
                }
            }
        };

        var convertToImage = function (canvas: any, width: number, height: number, type: string) {
            if ($support.canvas && $support.dataURL) {
                if (typeof canvas == "string") { canvas = document.getElementById(canvas); }
                if (type == undefined) { type = 'png'; }
                type = fixType(type);

                if (/bmp/.test(type)) {
                    var data = getImageData(scaleCanvas(canvas, width, height));
                    var strData = genBitmapImage(data);
                    return genImage(makeURI(strData, 'image/bmp'));
                } else {
                    var strData: string = getDataURL(canvas, type, width, height);
                    return genImage(strData);
                }
            }
        };

        var fileDownload = function (downloadUrl: string, type: string, fileName: string) {
            let aLink = document.createElement('a');
            aLink.style.display = 'none';
            aLink.href = downloadUrl;
            aLink.download = fileName + "." + type;
            // 触发点击-然后移除
            document.body.appendChild(aLink);
            aLink.click();
            document.body.removeChild(aLink);
        }

        return {
            saveAsImage: saveAsImage,
            saveAsPNG: function (canvas: CanvasImageSource, width: number, height: number) {
                return saveAsImage(canvas, width, height, 'png', 'defaultpng');
            },
            saveAsJPEG: function (canvas: CanvasImageSource, width: number, height: number) {
                return saveAsImage(canvas, width, height, 'jpeg', 'defaultjpg');
            },
            saveAsGIF: function (canvas: CanvasImageSource, width: number, height: number) {
                return saveAsImage(canvas, width, height, 'gif', 'defaultgif');
            },
            saveAsBMP: function (canvas: CanvasImageSource, width: number, height: number) {
                return saveAsImage(canvas, width, height, 'bmp', 'defaultbmp');
            },

            convertToImage: convertToImage,
            convertToPNG: function (canvas: any, width: number, height: number) {
                return convertToImage(canvas, width, height, 'png');
            },
            convertToJPEG: function (canvas: any, width: number, height: number) {
                return convertToImage(canvas, width, height, 'jpeg');
            },
            convertToGIF: function (canvas: any, width: number, height: number) {
                return convertToImage(canvas, width, height, 'gif');
            },
            convertToBMP: function (canvas: any, width: number, height: number) {
                return convertToImage(canvas, width, height, 'bmp');
            }
        };
    }
}