# bitsandpieces
Bits and pieces of useful code.

The best way to figure out what is really here is to browse through the folder structure.

This is a visual studio 2015 project so if you want to use that, you'll get VS2015 tooling. 

You'll need to make sure that whatever project you use for this has the various dependencies. I will probably create a bower.json file at some point so that it's easy to get them integrate in, but for now, you'll want at least:
- moment
- angular 1.5+
- SharePoint typings
- Typings for moment, etc.

# Whats in it?
- SharePoint REST Utility service (h/t Hunter P): the main value here is that it gets your digest stuff sorted out for you and does it on a timer, so that all your rest calls (when wrapped inside it) work as expected with SharePoint.
- MMSService: This is not fully baked, but for a given term group, it will find all the first level terms and then all of the 2nd level terms. So for instance, if you have a group called "xyzzy" and two term sets under it, "Country" and "Region", it will get Country and its children as well as Region and its children. If country or region have sub-terms themselves, it does not retrieve those.
- An interface defining a useful data structure for when your JSOM calls error out.
- BinaryFileUploadService: Used for a client project to upload an image to a folder in a sharepoint document library. This is not fully baked as of 8/19, but it does take a binary file (like an image) and upload it. The name and paths are currently all hard coded.


