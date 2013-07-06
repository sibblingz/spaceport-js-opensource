define('flash/display/LoaderInfo', [
	'proxy/create',
	'flash/display/DisplayObject',
	'flash/events/EventDispatcher',
	'bridge/silence',
	'bridge/send',
	'shared/defineReadOnly',
	'util/oop/instanceof',
	'util/loaderPatcher',
	'flash/system/ApplicationDomain',
	'flash/display/DisplayObjectContainer',
	'domain/applicationDomainDomains',
	'spid'
], function(
	createProxyClass,
	DisplayObject,
	EventDispatcher,
	silence,
	send,
	defineReadOnly,
	__instanceof,
	loaderPatcher,
	ApplicationDomain,
	DisplayObjectContainer,
	applicationDomainDomains,
	SPID
) {
	/** Loading information associated with a :class:`~sp.Loader`.
	 *
	 * Dispatched events
	 * -----------------
	 *
	 *  * :attr:`sp.Event.COMPLETE`
	 *  * :attr:`sp.IOErrorEvent.IO_ERROR`
	 */
	return createProxyClass('LoaderInfo', EventDispatcher, {
		alwaysShadow: true,
		methods: {
			fake: {
				/** The :class:`~sp.Loader` associated with the LoaderInfo. */
				'loader': {
					get: function() {
						return null;
					}
				},

				/** The content loaded, or ``null`` if no content has been loaded. */
				'content': {
					get: function() {
						return null;
					}
				},

				/** The :class:`~sp.ApplicationDomain` loaded, or ``null`` if no application domain has been loaded.
				 *
				 * Only a loaded SWF file will have an application domain.  The
				 * application domain will contain all of the exported symbols
				 * of the SWF file.
				 */
				'applicationDomain': {
					get: function() {
						return null;
					}
				},
				'destroy': function destroy(deep) {
					if(deep) {
						if(this.applicationDomain)
							this.applicationDomain.destroy(deep);
						
						if(this.content)
							this.content.destroy(deep);
					}

					EventDispatcher.prototype.destroy.call(this, deep);
				}
			}
		},
		patch: function patch(target, patch, mutator) {
			loaderPatcher(target, patch, mutator);
			
			var domain, applicationDomain; // All undefined
			if(patch.applicationDomain)
				applicationDomain = mutator.patch(applicationDomain, patch.applicationDomain);
			else
				applicationDomain = new ApplicationDomain.shadow();

			send('get', target, applicationDomain, 'applicationDomain');							
			defineReadOnly(target, 'applicationDomain', applicationDomain);
			domain = applicationDomainDomains[applicationDomain[SPID]];
			
			// Content may depend upon patch.applicationDomain
			if(patch.content) {
				var content = mutator.patch(target.content, patch.content, domain);
				defineReadOnly(target, 'content', content);
				send('get', target, content, 'content');

				if(__instanceof(content, DisplayObject))
					defineReadOnly(content, 'loaderInfo', target);

					// addChild because content becomes child of the Loader
				silence(function() {
						// target.loader.addChild always throws errors, so we
						// force adding a child here.
					DisplayObjectContainer.prototype.addChild.call(target.loader, content);
				});
			}
		}
	});
});
