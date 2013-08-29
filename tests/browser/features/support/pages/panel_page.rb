class ULSPage
	include PageObject

	include URL
	page_url URL.url('?setlang=<%=params[:setlang]%>')

	div(:panel_display, id: 'display-settings-block')
	div(:panel_input, id: 'input-settings-block')
	button(:panel_fonts, id: 'uls-display-settings-fonts-tab')
	button(:panel_language, id: 'uls-display-settings-language-tab')

	span(:panel_button_close, id: 'languagesettings-close')
	button(:panel_button_display_apply, id: 'uls-displaysettings-apply')

	button(:panel_disable_input_methods, class: 'uls-input-toggle-button')
	button(:panel_enable_input_methods, class: 'uls-input-toggle-button')

	select_list(:panel_content_font_selector, id: 'content-font-selector')
	select_list(:panel_interface_font_selector, id: 'ui-font-selector')

	# TODO: Rename to match convention
	button(:other_language_button, class: 'button uls-language-button')
	button(:default_language_button, class: 'button uls-language-button down')
end