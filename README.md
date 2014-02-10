vorcoder
========

Voronoi image encoder in JS.

This thing is hilariously slow.



Huh?
----

This is just a toy, really: it scatters N points randomly on an image, then makes voronoi cells over the points, then fills the cell with the average color of the pixels in the cell.

The notion is that labelling those points with that color could make a cheesy image compressor.  Except I forgot that I'm lazy.



No, seriously.  Huh?
--------------------

Lisa Edelstein at 10,000 cells:
![](VorCuddy10k.png)

Lisa Edelstein at 16,000 cells:
![](VorCuddy16k.png)

Lisa Edelstein at 28,000 cells:
![](VorCuddy28k.png)

Lisa Edelstein at 50,000 cells:
![](VorCuddy50k.png)



What if you wanted to do a good job, instead
--------------------------------------------

Then I'd probably:

* Add the scatter cells one at a time, at the location specified by the current worst pixel
* Make the fills a directional gradient instead of a flat color 
  * (lol figuring out what the gradient would be)
* Not use &lt;canvas&gt;, whose edges don't merge predictably between browsers even with magic
* Not use js frankly
* Find an encoding for the color-point-pixel-grads with nifty space characteristics
* screw you this question is mean i'm taking my ball and going home



Polemic :neckbeard:
===================

`vorcoder` is MIT licensed, because viral licenses and newspeak language modification are evil.  Free is ***only*** free when it's free for everyone.
