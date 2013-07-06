define('flash/display/Loader', [
	'proxy/create',
	'flash/display/DisplayObjectContainer',
	'flash/display/LoaderInfo',
	'shared/defineReadOnly',
	'flash/net/URLRequest',
	'util/coerceArguments',
	'util/warnDeveloper',
	'util/error/argNull'
], function(
	createProxyClass,
	DisplayObjectContainer,
	LoaderInfo,
	defineReadOnly,
	URLRequest,
	coerceArguments,
	warnDeveloper,
	argNull
) {
	function loaderNotImplemented() {
		throw new Error('The Loader class does not implement this method');
	}

	if(DEBUG) {
		// For Spaceport reflection (spaceport-metadata)
		loaderNotImplemented.ignore = true;
	}
	
	/** A DisplayObject which can load and display external art assets.
	 *
	 * Example::
	 *
	 *    var loader = new sp.Loader();
	 *    loader.contentLoaderInfo.addEventListener(sp.Event.COMPLETE, this.onAssetLoaded);
	 *    loader.load(new sp.URLRequest("path/to/asset.swf"));
	 *
	 *
	 *    onAssetLoaded: function onAssetLoaded(event) {
	 *        var content = event.target.content;
	 *        var appDomain = event.target.applicationDomain;
	 *    }
	 */
	return createProxyClass('Loader', DisplayObjectContainer, {
		constructor: function Loader() {
			defineReadOnly(this.contentLoaderInfo, 'loader', this);
		},
		references: {
			/** The :attr:`~sp.LoaderInfo` associated with the Loader. */
			'contentLoaderInfo': LoaderInfo
		},
		methods: {
			real: {
				/** Starts loading an art asset.
				 *
				 * :param request: The request to use to load the art asset.
				 *
				 * The :attr:`~sp.Loader.contentLoaderInfo` of the Loader will
				 * dispatch a :attr:`sp.Event.COMPLETE` event when the art
				 * completes loading.
				 *
				 * .. warning::
				 *
				 *    Do **not** listen to :attr:`sp.Event.COMPLETE` on the
				 *    Loader instance; you will not receive the event!  It is a
				 *    common mistake to listen to the completion event on the
				 *    Loader and not the :class:`~sp.LoaderInfo`.
				 */
				'load': function load(request) {
					if(request == null) { // Fuzzy
						throw argNull("request");
					}

					coerceArguments(arguments, [URLRequest]);
				}
			},
			fake: {
				'addChild': loaderNotImplemented,
				'addChildAt': loaderNotImplemented,
				'removeChild': loaderNotImplemented,
				'removeChildAt': loaderNotImplemented,
				'swapChildren': loaderNotImplemented,
				'swapChildrenAt': loaderNotImplemented,

				/** The content loaded using :func:`~sp.Loader.load`.
				 *
				 * The content may be either an instance of :class:`sp.Bitmap`
				 * (for a loaded JPG, PNG, or GIF) or an instance of
				 * :class:`sp.MovieClip` (for a loaded SWF).
				 *
				 * If the content has not yet been loaded, ``content`` equals
				 * ``null``.
				 */
				'content': {
					get: function() {
						if(!this.contentLoaderInfo)
							return null;
							
						return this.contentLoaderInfo.content;
					}
				},
				'addEventListener': function addEventListener(type, listener, useCapture, priority) {
					if(CUSTOMER_DEBUG) {
						if(type === 'complete') {
							warnDeveloper("Listener for Event.COMPLETE added to Loader instance; please listen for Event.COMPLETE on Loader.contentLoaderInfo instead");
						}
					}

					DisplayObjectContainer.prototype.addEventListener.call(this, type, listener, useCapture, priority);
				},
				'destroy': function destroy(deep) {
					if(deep)
						this.contentLoaderInfo.destroy(deep);

					// We detach children here because if we are deep destroying,
					// DisplayObjectContainer will destroy all the children.
					// However, contentLoaderInfo ALREADY destroys the content
					// so we're NOT destroying deeply going down
					DisplayObjectContainer.prototype.destroy.call(this, false);
				},
				'unloadAndStop': function unloadAndStop(gc) {
					var cli = this.contentLoaderInfo;
					if(cli) {
						var ad = cli.applicationDomain;
						if(ad) {
							ad.destroy(true);
							defineReadOnly(ad, 'applicationDomain', null);
						}

						var content = cli.content;
						if(content) {
							content.destroy(true);
							defineReadOnly(ad, 'content', null);
						}
					}
				}
			}
		}
	});
});
