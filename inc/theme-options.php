<?php
/**
 * Initialize the custom theme options.
 */
add_action( 'admin_init', 'custom_theme_options' );

/**
 * Build the custom settings & update OptionTree.
 */
function custom_theme_options() {
  /**
   * Get a copy of the saved settings array. 
   */
  $saved_settings = get_option( 'option_tree_settings', array() );
  
  /**
   * Custom settings array that will eventually be 
   * passes to the OptionTree Settings API Class.
   */
  $custom_settings = array( 
    'contextual_help' => array( 
      'sidebar'       => ''
    ),
    'sections'        => array(
      array(
        'id'          => 'home-page',
        'title'       => 'Home Page'
      ), 
        array(
        'id'          => 'partner-page',
        'title'       => 'Partner Page'
      ),    
       array(
        'id'          => 'group-page',
        'title'       => 'Group Page'
      ),      
       array(
        'id'          => 'contact-page',
        'title'       => 'Contact Page'
      ),   
    ),
    'settings'        => array( 
      array(
        'id'          => 'homepage_title',
        'label'       => 'Home Page Title',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'home-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
       array(
        'id'          => 'homepage_subtitle',
        'label'       => 'Homepage Subtitle',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'home-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
       array(
        'id'          => 'faq_title_home',
        'label'       => 'FAQ Homepage Title',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'home-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
       array(
        'id'          => 'faq_excerpt_home',
        'label'       => 'FAQ Homepage desc',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'home-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
        array(
        'id'          => 'live_feed',
        'label'       => 'Live Feed Text Home',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'home-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),

        array(
        'id'          => 'live_feed_desc',
        'label'       => 'Live Feed Description',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'home-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
        array(
        'id'          => 'partner_heading',
        'label'       => 'Partner Heading',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'partner-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),

        array(
        'id'          => 'partner_sub_heading',
        'label'       => 'Partner Sub Heading',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'partner-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),

        array(
        'id'          => 'partner_description',
        'label'       => 'Partner Description',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'partner-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
         array(
        'id'          => 'aboutus_heading',
        'label'       => 'Groups Heading',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'group-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
         array(
        'id'          => 'aboutus_vision_heading',
        'label'       => 'Groups Vision Heading',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'group-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
          array(
        'id'          => 'aboutus_vision_sub_heading',
        'label'       => 'Groups Vision Content',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'group-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
           array(
        'id'          => 'aboutus_mission_heading',
        'label'       => 'Groups Mission Heading',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'group-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),

           array(
        'id'          => 'aboutus_mission_sub_heading',
        'label'       => 'Groups Mission Content',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'group-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
           array(
        'id'          => 'groups_creator',
        'label'       => 'Groups Creator',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'group-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
            array(
        'id'          => 'groups_creator_content',
        'label'       => 'Groups Creator Description',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'group-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
            array(
        'id'          => 'contact_heading',
        'label'       => 'Contact Heading',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'contact-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
            array(
        'id'          => 'contact_description',
        'label'       => 'Contact Description',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'contact-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
             array(
        'id'          => 'contact_address_first',
        'label'       => 'Contact Address First Line',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'contact-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
              array(
        'id'          => 'contact_address_second',
        'label'       => 'Contact Address Second Line',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'contact-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
              array(
        'id'          => 'contact_address_phone',
        'label'       => 'Contact Phone number',
        'desc'        => '',
        'std'         => '',
        'type'        => 'text',
        'section'     => 'contact-page',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'class'       => ''
      ),
    )
  );
  
  /* allow settings to be filtered before saving */
  $custom_settings = apply_filters( 'option_tree_settings_args', $custom_settings );
  
  /* settings are not the same update the DB */
  if ( $saved_settings !== $custom_settings ) {
    update_option( 'option_tree_settings', $custom_settings ); 
  }
  
}