class PanelPage
	include PageObject
	include LanguageModule

	include URL
	page_url URL.url('?<%=params[:extra]%>')

	div(:uls, class: 'uls-menu')
	span(:uls_button_close, id: 'uls-close')

	div(:language_settings_dialog, id: 'language-settings-dialog')
	div(:panel_display, id: 'display-settings-block')
	div(:panel_input, id: 'input-settings-block')
	button(:panel_fonts, id: 'uls-display-settings-fonts-tab')
	button(:panel_language, id: 'uls-display-settings-language-tab')

	ul(:autonym, class: 'three columns end')

	span(:panel_button_close, id: 'languagesettings-close')
	button(:panel_button_apply, class: 'uls-settings-apply')
	button(:panel_button_cancel, class: 'uls-settings-cancel')

	button(:panel_disable_input_methods, class: 'uls-input-toggle-button')
	button(:panel_enable_input_methods, class: 'uls-input-toggle-button')

	select_list(:panel_content_font_selector, id: 'content-font-selector')
	select_list(:panel_interface_font_selector, id: 'ui-font-selector')

	# TODO: Rename to match convention
	button(:other_language_button, class: 'button uls-language-button', index: 1)
	button(:default_language_button, css: '.uls-language-button.down')

	# Triggers
	span(:trigger_cog, class: 'uls-settings-trigger')
	a(:trigger_personal, class: 'uls-trigger')

	select(:selected_content_font, id: 'content-font-selector')
	select(:selected_interface_font, id: 'ui-font-selector')

	select(:font_for_interface, id: 'ui-font-selector')
	select(:font_for_content, id: 'content-font-selector')

	div(:uls_display_settings, class: 'uls-display-settings')

	# Is there way to access the html element?
	div(:interface, id: 'footer')

	def content_font
		font('#mw-content-text')
	end

	def interface_font
		font('body')
	end

	def uls_onscreen?
		@browser.execute_script( "
			var $menu = $( '.uls-menu' ),
				$window = $( window ),
				top = $menu.offset().top,
				viewportTop = $window.scrollTop(),
				viewportBottom = $window.scrollTop() + $window.height();

			return ( top < viewportBottom && top >= viewportTop )" )
	end


	private
	def font(selector)
		@browser.execute_script( "return $( '#{selector}' ).css( 'font-family' );" )
	end
end
