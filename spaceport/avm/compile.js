define('avm/compile', [
	'avm/environment',
	'util/builtin/slice'
], function(
	environment,
	slice
) {
	// str needs explicit return (unlike plain eval)
	function evalBind(str) {
		var fn = Function('a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z', str);
		return fn.apply(null, slice.call(arguments, 1));
	}

	function compile(fnText) {
		var env = environment();
		var fn = evalBind.apply(null, [
			'ønamespaceNamespace=a,' +
			'øpackageNamespace=b,' +
			'øpackageInternalNamespace=c,' +
			'øprotectedNamespace=d,' +
			'øexplicitNamespace=e,' +
			'østaticProtectedNamespace=f,' +
			'øprivateNamespace=g,' +
			'ømultiname=h,' +
			'øglobal=i,' +
			'øfindLexProperty=j,' +
			'øgetLexProperty=k,' +
			'ølookUp=l,' +
			'øobject=m;' + // ;
			'return (' + fnText + ')'
		].concat(env));

		return fn;
	}

	return compile;
});
