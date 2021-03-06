// THIS FILE IS AUTOMATICALLY GENERATED FROM domain.sh
// DO NOT MODIFY MANUALLY!

define("domain/flashDomain", [
	'domain/Domain',
	"flash/display/BitmapData",
"flash/display/Bitmap",
"flash/display/BlendMode",
"flash/display/DisplayObjectContainer",
"flash/display/DisplayObject",
"flash/display/FrameLabel",
"flash/display/Graphics",
"flash/display/InteractiveObject",
"flash/display/LoaderInfo",
"flash/display/Loader",
"flash/display/MorphShape",
"flash/display/MovieClip",
"flash/display/Shape",
"flash/display/Sprite",
"flash/display/StageAlign",
"flash/display/StageAspectRatio",
"flash/display/Stage",
"flash/display/StageOrientation",
"flash/display/StageQuality",
"flash/display/StageScaleMode",
"flash/errors/EOFError",
"flash/errors/IOError",
"flash/events/AccelerometerEvent",
"flash/events/ErrorEvent",
"flash/events/EventDispatcher",
"flash/events/Event",
"flash/events/EventPhase",
"flash/events/HTTPStatusEvent",
"flash/events/IOErrorEvent",
"flash/events/KeyboardEvent",
"flash/events/MouseEvent",
"flash/events/OutputProgressEvent",
"flash/events/ProgressEvent",
"flash/events/StageOrientationEvent",
"flash/events/TextEvent",
"flash/events/TimerEvent",
"flash/events/TouchEvent",
"flash/filters/BitmapFilter",
"flash/filters/BitmapFilterQuality",
"flash/filters/BlurFilter",
"flash/filters/ColorMatrixFilter",
"flash/filters/DropShadowFilter",
"flash/filters/GlowFilter",
"flash/geom/ColorTransform",
"flash/geom/Matrix",
"flash/geom/Point",
"flash/geom/Rectangle",
"flash/geom/Transform",
"flash/media/SoundChannel",
"flash/media/Sound",
"flash/media/SoundTransform",
"flash/net/navigateToURL",
"flash/net/sendToURL",
"flash/net/SharedObject",
"flash/net/Socket",
"flash/net/URLLoaderDataFormat",
"flash/net/URLLoader",
"flash/net/URLRequestHeader",
"flash/net/URLRequest",
"flash/net/URLRequestMethod",
"flash/net/URLVariables",
"flash/sensors/Accelerometer",
"flash/system/ApplicationDomain",
"flash/system/Capabilities",
"flash/system/LoaderContext",
"flash/system/SecurityDomain",
"flash/system/Security",
"flash/text/StaticText",
"flash/text/TextFieldAutoSize",
"flash/text/TextField",
"flash/text/TextFieldType",
"flash/text/TextFormatAlign",
"flash/text/TextFormat",
"flash/transitions/easing/Back",
"flash/transitions/easing/Bounce",
"flash/transitions/easing/Circular",
"flash/transitions/easing/Cubic",
"flash/transitions/easing/Elastic",
"flash/transitions/easing/Exponential",
"flash/transitions/easing/Linear",
"flash/transitions/easing/Quadratic",
"flash/transitions/easing/Quartic",
"flash/transitions/easing/Quintic",
"flash/transitions/easing/Sine",
"flash/transitions/TweenEvent",
"flash/transitions/Tween",
"flash/ui/Keyboard",
"flash/ui/KeyboardType",
"flash/ui/Mouse",
"flash/utils/ByteArray",
"flash/utils/clearInterval",
"flash/utils/clearTimeout",
"flash/utils/Endian",
"flash/utils/getDefinitionByName",
"flash/utils/getQualifiedClassName",
"flash/utils/getQualifiedSuperclassName",
"flash/utils/getTimer",
"flash/utils/setInterval",
"flash/utils/setTimeout",
"flash/utils/Timer"
], function(Domain) {
	var fqns = [
		"flash.display::BitmapData",
"flash.display::Bitmap",
"flash.display::BlendMode",
"flash.display::DisplayObjectContainer",
"flash.display::DisplayObject",
"flash.display::FrameLabel",
"flash.display::Graphics",
"flash.display::InteractiveObject",
"flash.display::LoaderInfo",
"flash.display::Loader",
"flash.display::MorphShape",
"flash.display::MovieClip",
"flash.display::Shape",
"flash.display::Sprite",
"flash.display::StageAlign",
"flash.display::StageAspectRatio",
"flash.display::Stage",
"flash.display::StageOrientation",
"flash.display::StageQuality",
"flash.display::StageScaleMode",
"flash.errors::EOFError",
"flash.errors::IOError",
"flash.events::AccelerometerEvent",
"flash.events::ErrorEvent",
"flash.events::EventDispatcher",
"flash.events::Event",
"flash.events::EventPhase",
"flash.events::HTTPStatusEvent",
"flash.events::IOErrorEvent",
"flash.events::KeyboardEvent",
"flash.events::MouseEvent",
"flash.events::OutputProgressEvent",
"flash.events::ProgressEvent",
"flash.events::StageOrientationEvent",
"flash.events::TextEvent",
"flash.events::TimerEvent",
"flash.events::TouchEvent",
"flash.filters::BitmapFilter",
"flash.filters::BitmapFilterQuality",
"flash.filters::BlurFilter",
"flash.filters::ColorMatrixFilter",
"flash.filters::DropShadowFilter",
"flash.filters::GlowFilter",
"flash.geom::ColorTransform",
"flash.geom::Matrix",
"flash.geom::Point",
"flash.geom::Rectangle",
"flash.geom::Transform",
"flash.media::SoundChannel",
"flash.media::Sound",
"flash.media::SoundTransform",
"flash.net::navigateToURL",
"flash.net::sendToURL",
"flash.net::SharedObject",
"flash.net::Socket",
"flash.net::URLLoaderDataFormat",
"flash.net::URLLoader",
"flash.net::URLRequestHeader",
"flash.net::URLRequest",
"flash.net::URLRequestMethod",
"flash.net::URLVariables",
"flash.sensors::Accelerometer",
"flash.system::ApplicationDomain",
"flash.system::Capabilities",
"flash.system::LoaderContext",
"flash.system::SecurityDomain",
"flash.system::Security",
"flash.text::StaticText",
"flash.text::TextFieldAutoSize",
"flash.text::TextField",
"flash.text::TextFieldType",
"flash.text::TextFormatAlign",
"flash.text::TextFormat",
"flash.transitions.easing::Back",
"flash.transitions.easing::Bounce",
"flash.transitions.easing::Circular",
"flash.transitions.easing::Cubic",
"flash.transitions.easing::Elastic",
"flash.transitions.easing::Exponential",
"flash.transitions.easing::Linear",
"flash.transitions.easing::Quadratic",
"flash.transitions.easing::Quartic",
"flash.transitions.easing::Quintic",
"flash.transitions.easing::Sine",
"flash.transitions::TweenEvent",
"flash.transitions::Tween",
"flash.ui::Keyboard",
"flash.ui::KeyboardType",
"flash.ui::Mouse",
"flash.utils::ByteArray",
"flash.utils::clearInterval",
"flash.utils::clearTimeout",
"flash.utils::Endian",
"flash.utils::getDefinitionByName",
"flash.utils::getQualifiedClassName",
"flash.utils::getQualifiedSuperclassName",
"flash.utils::getTimer",
"flash.utils::setInterval",
"flash.utils::setTimeout",
"flash.utils::Timer"
	];

	var args = arguments;

	var myDomain = new Domain("flash");
	fqns.forEach(function(fqn, index) {
		// 1 matches number of manual dependencies
		myDomain.classes[fqn] = args[index + 1];
	});

	return myDomain;
});

