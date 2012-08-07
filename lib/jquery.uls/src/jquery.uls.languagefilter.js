/**
 * jQuery language filter plugin.
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

/**
 * Usage: $( 'inputbox' ).languagefilter();
 * The values for autocompletion is from the options.languages.
 * The data is in the format of languagecode:languagename.
 */

(function ( $ ) {
	"use strict";

	var LanguageFilter = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.regionselector.defaults, options );
		this.$element.addClass( 'languagefilter' );
		this.resultCount = 0;
		this.$suggestion = $( '#' + this.$element.data( 'suggestion' ) );
		this.$clear = $( '#'+ this.$element.data( 'clear' ) );
		this.listen();
	};

	var delay = function() {
		var timer = 0;
		return ( function( callback, milliseconds ) {
			clearTimeout( timer );
			timer = setTimeout( callback, milliseconds );
		} );
	}();

	LanguageFilter.prototype = {

		listen: function() {
			this.$element.on( 'keypress', $.proxy( this.keyup, this ) )
				.on( 'keyup', $.proxy( this.keyup, this ) );
			if ( $.browser.webkit || $.browser.msie ) {
				this.$element.on( 'keydown', $.proxy( this.keyup, this ) );
			}
			if ( this.$clear.length ) {
				this.$clear.on( 'click' , $.proxy( this.clear, this ) );
			}
			this.toggleClear();
		},

		keyup: function( e ) {
			switch( e.keyCode ) {
				case 9: // Tab -> Autocomplete
					var suggestion = this.$suggestion.val();
					if ( suggestion && suggestion !== this.$element.val() ) {
						this.$element.val( suggestion );
						e.preventDefault();
						e.stopPropagation();
					} else {
						this.options.$target.focus();
					}
				default:
					var that = this;
					delay( function() {
						that.options.$target.empty();
						that.search();
					}, 300 );
					this.toggleClear();
			}
		},

		clear: function() {
			this.$element.val( '' );
			this.$element.focus();
			this.toggleClear();
			this.search();
		},

		toggleClear: function() {
			if ( !this.$clear.length ) {
				return;
			}

			if ( this.$element.val() ) {
				this.$clear.show();
			} else {
				this.$clear.hide();
			}
		},

		search: function() {
			var query = $.trim( this.$element.val() ),
				languages = $.uls.data.languagesByScriptGroup( this.options.languages ),
				scriptGroup, langNum, langCode;
			this.resultCount = 0;
			for ( scriptGroup in languages ) {
				var languagesInScript = languages[scriptGroup];
				languagesInScript.sort( $.uls.data.sortByAutonym );
				for ( langNum = 0; langNum < languagesInScript.length; langNum++ ) {
					langCode = languagesInScript[langNum];
					if ( query === "" || this.filter( langCode, query ) ) {
						if ( this.resultCount === 0 ) {
							// Autofill the first result.
							this.autofill( langCode );
						}
						this.render( langCode );
						this.resultCount++;
					}
				}
			}
			// Also do a search by search API
			if( !this.resultCount && this.options.searchAPI && query ) {
				this.searchAPI( query );
			} else {
				this.resultHandler( query );
			}
		},

		searchAPI: function( query ) {
			var that = this;
			$.get( that.options.searchAPI, { search: query }, function( result ) {
				$.each( result['languagesearch'], function( code, name ) {
					if ( that.resultCount === 0 ) {
						// Autofill the first result.
						that.autofill( code, name );
					}
					that.render( code );
					that.resultCount++;
				} );
				that.resultHandler( query );
			} );
		},

		/**
		 * Handler method to be called once search is over.
		 * Based on search result call success or noresults callbacks
		 * @param String query
		 */
		resultHandler: function( query ) {
			if ( this.resultCount === 0 && this.options.noresults ) {
				this.options.noresults.call( this, query );
			} else if ( this.options.success ) {
				this.options.success( this, query, this.resultCount );
			}
		},

		autofill: function( langCode, languageName ) {
			if ( !this.$suggestion.length ) {
				return;
			}
			if ( !this.$element.val() ) {
				this.$suggestion.val( '' );
				return;
			}
			languageName = languageName || this.options.languages[langCode];
			var autonym,
				userInput = this.$element.val(),
				suggestion = userInput + languageName.substring( userInput.length, languageName.length );
			if ( suggestion !== languageName ) {
				// see if it was autonym match
				autonym = $.uls.data.autonym( langCode ) || '';
				suggestion = userInput + autonym.substring( userInput.length, autonym.length );
				if ( suggestion !== autonym ) {
					// Give up. It may be iso/script code match.
					suggestion = "";
				}
			}
			this.$suggestion.val( suggestion );
		},

		render: function( langCode ) {
			var $target = this.options.$target;
			if ( !$target ) {
				return;
			}
			$target.append( langCode, null );
		},

		escapeRegex: function( value ) {
			return value.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" );
		},

		/**
		 * A search match happens if any of the following passes:
		 * a) Language name in current user interface language
		 * 'starts with' search string.
		 * b) Language autonym 'starts with' search string.
		 * c) ISO 639 code match with search string.
		 * d) ISO 15924 code for the script match the search string.
		 */
		filter: function( langCode, searchTerm ) {
			// FIXME script is ISO 15924 code. We might need actual name of script.
			var matcher = new RegExp( "^" + this.escapeRegex( searchTerm ), 'i' ),
				languageName = this.options.languages[langCode];
			return matcher.test( languageName ) ||
				matcher.test( $.uls.data.autonym( langCode ) ) ||
				matcher.test( langCode ) ||
				matcher.test( $.uls.data.script( langCode ) );
		}

	};

	$.fn.languagefilter = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'languagefilter' ),
				options = typeof option === 'object' && option;
			if ( !data ) {
				$this.data( 'languagefilter', ( data = new LanguageFilter( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.languagefilter.defaults = {
		$target: null, // Where to append the results
		searchAPI: null,
		languages: null, // Languages as code:name format.
		noresults: null, // callback for no results found case
		success: null // callback if any results found.
	};

	$.fn.languagefilter.Constructor = LanguageFilter;

	/* RegionSelector plugin definition */

	/**
	 * Region selector is a language selector based on regions.
	 * Usage: $( 'jqueryselector' ).regionselector( options );
	 * The attached element should have data-regiongroup attribute
	 * that defines the regiongroup for the selector.
	 */
	var RegionSelector = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.regionselector.defaults, options );
		this.$element.addClass( 'regionselector' );
		this.regions = [];
		this.regionGroup = this.$element.data( 'regiongroup' );
		this.init();
		this.listen();
	};

	RegionSelector.prototype = {
		constructor: RegionSelector,

		init: function() {
			var region =  this.$element.data( 'region' );
			this.regions = $.uls.data.regionsInGroup( this.regionGroup );
			if ( region ) {
				this.regions.push( region );
			}
		},

		test: function( langCode ) {
			var langRegions = $.uls.data.regions( langCode ),
				region;

			for ( var i = 0; i < this.regions.length; i++ ) {
				region = this.regions[i];
				if ( $.inArray( region, langRegions ) >= 0 ) {
					this.render( langCode, region );
					return;
				}
			}
		},

		show: function() {
			// Make the selected region (and it only) active
			$( '.regionselector' ).removeClass( 'active' );
			if ( this.regionGroup ) {
				// if there is a region group, make it active.
				this.$element.addClass( 'active' );
			}

			// Re-populate the list of languages
			this.options.$target.empty();
			var languagesByScriptGroup = $.uls.data.languagesByScriptGroup( this.options.languages );
			for ( var scriptGroup in languagesByScriptGroup ) {
				var languages = languagesByScriptGroup[scriptGroup];
				languages.sort( $.uls.data.sortByAutonym );
				for ( var i = 0; i < languages.length; i++ ) {
					this.test( languages[i] );
				}
			}

			if ( this.options.success ) {
				this.options.success.call();
			}
		},

		render: function( langCode, region ) {
			var $target = this.options.$target;
			if ( !$target ) {
				return;
			}
			$target.append( langCode, region );
		},

		listen: function() {
			this.$element.on( 'click', $.proxy( this.click, this ) );
		},

		click: function( e ) {
			e.stopPropagation();
			e.preventDefault();
			this.show();
		}
	};

	/* RegionSelector plugin definition */

	$.fn.regionselector = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'regionselector' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'regionselector', ( data = new RegionSelector( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.regionselector.defaults = {
		$target: null, // Where to render the results
		success: null, // callback if any results found.
		languages: null
	};

	$.fn.regionselector.Constructor = RegionSelector;

} )( jQuery );