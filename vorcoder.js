
function VorAnneal(Options) {





  var voronoi      = new Voronoi();
  var it           = new ImgTools();

  var iHeight      = Options.image.height;
  var iWidth       = Options.image.width;

  var HighestCost  = 0;
  var HighestCoord = [0,0];

  var Points       = [];





  var rnd = function(X) {
    return Math.floor(Math.random() * X);
  };





  var hexedByte = function(B) {

    var sForm = B.toString(16);

    return (sForm.length < 2)? ('0'+sForm) : sForm;

  }





  var opaqueColorToString = function(cArray) {

    return '#' + hexedByte(cArray[0]) + hexedByte(cArray[1]) + hexedByte(cArray[2]);

  }





  this.genRandPoint = function() {

    var c1 = [ rnd(256), rnd(256), rnd(256) ];
    var c2 = [ rnd(256), rnd(256), rnd(256) ];

    var lcx1 = rnd(32)-16;
    var lcy1 = rnd(32)-16;
    var lcx2 = rnd(32)-16;
    var lcy2 = rnd(32)-16;

    console.log(lcx1.toString() + ',' + lcy1.toString() + ',' + lcx2.toString() + ',' + lcy2.toString() + ',');

    return {

      x      : rnd(iWidth),
      y      : rnd(iHeight),

      color1 : c1,
      cStr1  : opaqueColorToString(c1),

      color2 : c2,
      cStr2  : opaqueColorToString(c2),

      cx1    : lcx1,
      cy1    : lcy1,
      cx2    : lcx2,
      cy2    : lcy2

    };

  };





  this.genRandPointCloud = function(N) {

    var Ret = [];

    for (var i=0; i<N; ++i) {
      Ret.push(this.genRandPoint());
    }

    return Ret;

  }





  var setPixel = function(tgt, x, y, r, g, b, a) {

    index = (x + y * imageData.width) * 4;

    tgt.data[index+0] = r;
    tgt.data[index+1] = g;
    tgt.data[index+2] = b;
    tgt.data[index+3] = a;

  }






  var diffPixel = function(src1, src2, tgt, x, y) {

    index = (x + y * imageData.width) * 4;

    var rD   = Math.max(0, Math.min(255, Math.abs(Math.floor(src1.data[index+0] - src2.data[index+0]))));
    var gD   = Math.max(0, Math.min(255, Math.abs(Math.floor(src1.data[index+1] - src2.data[index+1]))));
    var bD   = Math.max(0, Math.min(255, Math.abs(Math.floor(src1.data[index+2] - src2.data[index+2]))));

    var Cost = rD + gD + bD;
    if (Cost > HighestCost) {
        HighestCost  = Cost;
        HighestCoord = [x,y];
    }

    tgt.data[index+0] = rD;
    tgt.data[index+1] = gD;
    tgt.data[index+2] = bD;

    tgt.data[index+3] = 255;

  }






  this.iDiff = function(i1, i2, tgt, report) {

    HighestCost  = 0;
    HighestCoord = [0,0];

    it.assignMatchCanvasSize(i1, tgt);

    var ctx1 = i1.getContext('2d');
    var ctx2 = i2.getContext('2d');
    var ctxT = tgt.getContext('2d');

    var iD1 = ctx1.getImageData(0,0, iWidth, iHeight);
    var iD2 = ctx2.getImageData(0,0, iWidth, iHeight);
    var iDT = ctxT.createImageData(iWidth, iHeight);

    for (var w=0; w<iWidth; ++w) {
      for (var h=0; h<iHeight; ++h) {

        diffPixel(iD1, iD2, iDT, w, h);

      }
    }

    ctxT.putImageData(iDT, 0,0);
    
    if (report != undefined) {
      report.innerHTML = '(' + HighestCoord[0].toString() + ',' + HighestCoord[1].toString() + '): ' + HighestCost.toString();
    }

  }





  this.setupImage = function(Original, Canvas) {

    var img = document.getElementById('image');
    it.imageToCanvas(img, Original);
    it.assignMatchCanvasSize(Original, Canvas);
    img.style.display = 'none';

    return img;

  }





  this.fetchCornersAsPoints = function(OrigImgD) {

    var xLim  = iWidth  - 1;
    var yLim  = iHeight - 1;
    var yLimX = yLim * iWidth;
    var xyLim = yLimX + xLim;

    var index = 0;            var ulC   = [ OrigImgD.data[index+0], OrigImgD.data[index+1], OrigImgD.data[index+2] ];
        index = xLim*4;       var urC   = [ OrigImgD.data[index+0], OrigImgD.data[index+1], OrigImgD.data[index+2] ];
        index = yLimX * 4;    var llC   = [ OrigImgD.data[index+0], OrigImgD.data[index+1], OrigImgD.data[index+2] ];
        index = xyLim * 4;    var lrC   = [ OrigImgD.data[index+0], OrigImgD.data[index+1], OrigImgD.data[index+2] ];

    var cc = [255,242,233];

    return [

      {x:0,    y:0,    color1:ulC, cStr1:opaqueColorToString(ulC), color2:ulC, cStr2:opaqueColorToString(ulC), cx1:0,cx2:0,cy1:0,cy2:0},
      {x:xLim, y:0,    color1:urC, cStr1:opaqueColorToString(urC), color2:urC, cStr2:opaqueColorToString(urC), cx1:0,cx2:0,cy1:0,cy2:0},
      {x:0,    y:yLim, color1:llC, cStr1:opaqueColorToString(llC), color2:llC, cStr2:opaqueColorToString(llC), cx1:0,cx2:0,cy1:0,cy2:0},
      {x:xLim, y:yLim, color1:lrC, cStr1:opaqueColorToString(lrC), color2:lrC, cStr2:opaqueColorToString(lrC), cx1:0,cx2:0,cy1:0,cy2:0}

    ];


  }





  this.RenderBase = function(Original, ctx) {

    var halfedges, nHalfedges, iHalfedge;
    var v;

    ctx.clearRect(0,0, iWidth, iHeight);

    result    = voronoi.compute(Points, { xl:0, xr:iWidth, yt:0, yb:iHeight });
    var cells = result.cells;

    for (var cellid in cells) {

      halfedges  = cells[cellid].halfedges;
      nHalfedges = halfedges.length;

      v = halfedges[0].getStartpoint();
      ctx.beginPath();
      ctx.moveTo(v.x,v.y);

      for (iHalfedge=0; iHalfedge<nHalfedges; iHalfedge++) {
        v = halfedges[iHalfedge].getEndpoint();
        ctx.lineTo(v.x,v.y);
      }
/*
      gradient = tgtContext.createLinearGradient(
        Points[cellid].x + Points[cellid].cx1,
        Points[cellid].y + Points[cellid].cy1,
        Points[cellid].x + Points[cellid].cx2,
        Points[cellid].y + Points[cellid].cy2
      );

      gradient.addColorStop(0, result.cells[cellid].site.cStr1);
      gradient.addColorStop(1, result.cells[cellid].site.cStr2);

      ctx.fillStyle = gradient;
*/
      ctx.fillStyle = result.cells[cellid].site.cStr1;
      ctx.fill();

    }

    this.iDiff(document.getElementById('orig'), document.getElementById('tgt'), document.getElementById('diff'), document.getElementById('report'));

  }





  this.Render = function(Original, Canvas, Config) {

    var img        = this.setupImage(Original, Canvas);
    var OrigImgD   = Original.getContext('2d').getImageData(0,0, iWidth, iHeight);

    Points         = this.fetchCornersAsPoints(OrigImgD);
    var PointsLeft = Config.points - Points.length;

    var ctx        = Canvas.getContext('2d');
    ctx.globalCompositeOperation="lighter";

    var first      = true;

    while (PointsLeft > 0) {

//      if (first) { first = false; } else { OrigImgD = Original.getContext('2d').getImageData(0,0, iWidth, iHeight); }

//      this.RenderBase(Original, ctx);

//    var nX     = HighestCoord[0];
//    var nY     = HighestCoord[1];

      var nX     = rnd(iWidth);
      var nY     = rnd(iHeight);

      var index  = (nX + (nY*iWidth))*4;
      var nColor = [ OrigImgD.data[index+0], OrigImgD.data[index+1], OrigImgD.data[index+2] ];

      Points.push({x:nX, y:nY, color1: nColor, cStr1:opaqueColorToString(nColor), color2:nColor, cStr2:opaqueColorToString(nColor), cx1:0,cx2:0,cy1:0,cy2:0});
      --PointsLeft;

    }

    this.RenderBase(Original, ctx);

  }





}
