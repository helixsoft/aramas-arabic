<?php
/*****************************************************************************/
/*Define Constants*/
/*****************************************************************************/

define('THEMEROOT', get_stylesheet_directory_uri());
define('IMAGES',THEMEROOT. '/images');

/**
 * Sets up theme defaults and registers the various WordPress features that
 * ar supports.
 */
function ar_setup() {
	/*
	 * Makes ar available for translation.
	 *
	 * Translations can be added to the /languages/ directory.
	 * If you're building a theme based on Twenty Thirteen, use a find and
	 * replace to change 'twentythirteen' to the name of your theme in all
	 * template files.
	 */

	//require( get_template_directory() . '/inc/widgets.php' );
	// Adds RSS feed links to <head> for posts and comments.
	//add_theme_support( 'automatic-feed-links' );
	/*
	 * This theme supports all available post formats by default.
	 * See http://codex.wordpress.org/Post_Formats
	 */
	add_theme_support( 'post-formats', array(
		 'video'
	) );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menu( 'primary', __( 'Navigation Menu', 'ar' ) );
	register_nav_menu( 'footer-nav', __( 'Footer Menu', 'ar' ) );

	/*
	 * This theme uses a custom image size for featured images, displayed on
	 * "standard" posts and pages.
	 */
	add_theme_support( 'post-thumbnails' );
	//set_post_thumbnail_size( 300, 150, true );
	add_image_size( 'small-list-container',100, 68,true);
	add_image_size( 'thumbnail-container',150, 100,true);
	add_image_size( 'slider-container',630, 420,true);
	add_image_size('small-footer',140,180,true);
	add_image_size('full-size',1000,390,true);
	add_image_size('full',460,115,true);
}
add_action( 'after_setup_theme', 'ar_setup' );

function custom_excerpt_length( $length ) {
		return 35;
	}
	add_filter( 'excerpt_length', 'custom_excerpt_length',999 );
	
	function new_excerpt_more( $more ) {
		return '';
	}
	add_filter('excerpt_more', 'new_excerpt_more');

function aramas_scripts_styles() {
	wp_deregister_script('jquery');
	wp_register_script('jquery', "//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js", false, true);
	wp_enqueue_script('jquery');
	wp_enqueue_script( 'main', get_template_directory_uri() . '/js/main.js', array( 'jquery' ), false, true );
	
}
add_action( 'wp_enqueue_scripts', 'aramas_scripts_styles' );

/**
 * Loads a set of CSS and/or Javascript documents. 
 */
function mega_enqueue_admin_scripts($hook) {
	wp_register_style( 'ot-admin-custom', get_template_directory_uri() . '/inc/css/ot-admin-custom.css' );
	if ( $hook == 'appearance_page_ot-theme-options' ) {
		wp_enqueue_style( 'ot-admin-custom' );
	}

	wp_register_style( 'admin.custom', get_template_directory_uri() . '/inc/css/admin.custom.css' );
	wp_register_script( 'jquery.admin.custom', get_template_directory_uri() . '/inc/jquery.admin.custom.js', array( 'jquery' ) );
	if( $hook != 'edit.php' && $hook != 'post.php' && $hook != 'post-new.php' ) 
		return;
	wp_enqueue_style( 'admin.custom' );
	wp_enqueue_script( 'jquery.admin.custom' );
}
add_action( 'admin_enqueue_scripts', 'mega_enqueue_admin_scripts' );

// Gallery
function mega_clean( $var ) {
	return sanitize_text_field( $var );
}

	/**
 * Get Vimeo & YouTube Thumbnail.
 */
function mega_get_video_image($url){
	if(preg_match('/youtube/', $url)) {			
		if(preg_match('/[\\?\\&]v=([^\\?\\&]+)/', $url, $matches)) {
			return "http://img.youtube.com/vi/".$matches[1]."/default.jpg";  
		}
	}
	elseif(preg_match('/vimeo/', $url)) {			
		if(preg_match('~^http://(?:www\.)?vimeo\.com/(?:clip:)?(\d+)~', $url, $matches))	{
				$id = $matches[1];	
				if (!function_exists('curl_init')) die('CURL is not installed!');
				$url = "http://vimeo.com/api/v2/video/".$id.".php";
				$ch = curl_init();
				curl_setopt($ch, CURLOPT_URL, $url);
				curl_setopt($ch, CURLOPT_HEADER, 0);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt($ch, CURLOPT_TIMEOUT, 10);
				$output = unserialize(curl_exec($ch));
				$output = $output[0]["thumbnail_medium"]; 
				curl_close($ch);
				return $output;
		}
	}		
}

/**
 * Retrieve YouTube/Vimeo iframe code from URL.
 */
function mega_get_video( $postid, $width = 940, $height = 308 ) {	
	$video_url = get_post_meta( $postid, 'mega_youtube_vimeo_url', true );	
	if(preg_match('/youtube/', $video_url)) {			
		if(preg_match('/[\\?\\&]v=([^\\?\\&]+)/', $video_url, $matches)) {
			$output = '<iframe width="'. $width .'" height="'. $height .'" src="http://www.youtube.com/embed/'.$matches[1].'?wmode=transparent&showinfo=0&rel=0" frameborder="0" allowfullscreen></iframe> ';
		}
		else {
			$output = __( 'Sorry that seems to be an invalid YouTube URL.', 'mega' );
		}			
	}
	elseif(preg_match('/vimeo/', $video_url)) {			
		if(preg_match('~^http://(?:www\.)?vimeo\.com/(?:clip:)?(\d+)~', $video_url, $matches))	{				
			$output = '<iframe src="http://player.vimeo.com/video/'. $matches[1] .'?title=0&amp;byline=0&amp;portrait=0" width="'. $width .'" height="'. $height .'" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe>';         	
		}
		else {
			$output = __( 'Sorry that seems to be an invalid Vimeo URL.', 'mega' );
		}			
	}
	else {
		$output = __( 'Sorry that seems to be an invalid YouTube or Vimeo URL.', 'mega' );
	}	
	echo $output;	
}


/**
 * Load up our theme meta boxes and related code.
 */
	require( get_template_directory() . '/inc/meta-functions.php' );
	require( get_template_directory() . '/inc/meta-box-post.php' );
	require( get_template_directory() . '/inc/meta-box-page.php' );
	require( get_template_directory() . '/inc/meta-box-service.php' );
/*	require( get_template_directory() . '/inc/meta-box-livefeed.php' );
/*	require( get_template_directory() . '/inc/meta-box-partner.php' );
/**
 * Registering a post type called "Service".
 */
function create_service_type() {
	register_post_type( 'service',
		array(
			'labels' => array(
				'name' => __( 'Services', 'ar' ),
				'singular_name' => __( 'Service', 'ar' ),
				'add_new' => _x( 'Add New Service', 'service', 'ar' ),
				'add_new_item' => __( 'Add New Service', 'ar' ),
				'edit_item' => __( 'Edit Service', 'ar' ),
				'new_item' => __( 'New Service', 'ar' ),
				'all_items' => __( 'All Service', 'ar' ),
				'view_item' => __( 'View Service', 'ar' ),
				'search_items' => __( 'Search Service', 'ar' ),
				'not_found' =>  __( 'No Services found', 'ar' ),
				'not_found_in_trash' => __( 'No Services found in Trash', 'ar' )
			),
			'publicly_queryable' => true,
			'show_ui' => true, 
			'show_in_menu' => true,
			'show_in_nav_menus' => true,
			'query_var' => true,
			'rewrite' => array( 'slug' => 'service', 'with_front' => false ),
			'capability_type' => 'post',
			'has_archive' => true,
			'public' => true,
			'hierarchical' => false,
			'menu_position' => 5,
			'exclude_from_search' => false,
			'supports' => array( 'title', 'editor','thumbnail' )
		)
	);
}
add_action( 'init', 'create_service_type' );

// create taxonomy, categories for the post type "Services"
function create_service_taxonomies() {
	$labels = array(
		'name' => __( 'Service Categories', 'mega' ),
		'singular_name' => __( 'Category', 'mega' ),
		'all_items' => __( 'All Categories', 'mega' ),
	); 
	register_taxonomy( 'service-category', array( 'service' ), array(
		'hierarchical' => true,
		'labels' => $labels,
		'show_ui' => true,
		'show_tagcloud' => false,
		'show_in_nav_menus' => true,
		'query_var' => true
	) );
}
add_action( 'init', 'create_service_taxonomies' );
// add filter to ensure the text Issue, or issue, is displayed when user updates a issue 
function service_updated_messages( $messages ) {
  global $post, $post_ID;

  $messages['service'] = array(
    0 => '', // Unused. Messages start at index 1.
    1 => sprintf( __('Service updated. <a href="%s">View Service</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    2 => __('Custom field updated.', 'ar'),
    3 => __('Custom field deleted.', 'ar'),
    4 => __('Service updated.', 'ar'),
    /* translators: %s: date and time of the revision */
    5 => isset($_GET['revision']) ? sprintf( __('Service restored to revision from %s', 'ar'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
    6 => sprintf( __('Service published. <a href="%s">View Service</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    7 => __('Service saved.', 'ar'),
    8 => sprintf( __('Service submitted. <a target="_blank" href="%s">Preview Service</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
    9 => sprintf( __('Service scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview Service</a>', 'ar'),
      // translators: Publish box date format, see http://php.net/date
      date_i18n( __( 'M j, Y @ G:i', 'ar' ), strtotime( $post->post_date ) ), esc_url( get_permalink($post_ID) ) ),
    10 => sprintf( __('Service draft updated. <a target="_blank" href="%s">Preview Service</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
  );

  return $messages;
}
add_filter( 'post_updated_messages', 'service_updated_messages' );

/**
 * Registering a post type called "FAQ".
 */
function create_faq_type() {
	register_post_type( 'faq',
		array(
			'labels' => array(
				'name' => __( 'FAQs', 'ar' ),
				'singular_name' => __( 'FAQ', 'ar' ),
				'add_new' => _x( 'Add New FAQ', 'faq', 'ar' ),
				'add_new_item' => __( 'Add New FAQ', 'ar' ),
				'edit_item' => __( 'Edit FAQ', 'ar' ),
				'new_item' => __( 'New FAQ', 'ar' ),
				'all_items' => __( 'All FAQ', 'ar' ),
				'view_item' => __( 'View FAQ', 'ar' ),
				'search_items' => __( 'Search FAQ', 'ar' ),
				'not_found' =>  __( 'No FAQs found', 'ar' ),
				'not_found_in_trash' => __( 'No FAQs found in Trash', 'ar' )
			),
			'publicly_queryable' => true,
			'show_ui' => true, 
			'show_in_menu' => true,
			'show_in_nav_menus' => true,
			'query_var' => true,
			'rewrite' => array( 'slug' => 'faq', 'with_front' => false ),
			'capability_type' => 'post',
			'has_archive' => true,
			'public' => true,
			'hierarchical' => false,
			'menu_position' => 5,
			'exclude_from_search' => false,
			'supports' => array( 'title', 'editor' )
		)
	);
}
add_action( 'init', 'create_faq_type' );

// add filter to ensure the text Issue, or issue, is displayed when user updates a issue 
function faq_updated_messages( $messages ) {
  global $post, $post_ID;

  $messages['faq'] = array(
    0 => '', // Unused. Messages start at index 1.
    1 => sprintf( __('FAQ updated. <a href="%s">View FAQ</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    2 => __('Custom field updated.', 'ar'),
    3 => __('Custom field deleted.', 'ar'),
    4 => __('FAQ updated.', 'ar'),
    /* translators: %s: date and time of the revision */
    5 => isset($_GET['revision']) ? sprintf( __('FAQ restored to revision from %s', 'ar'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
    6 => sprintf( __('FAQ published. <a href="%s">View FAQ</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    7 => __('FAQ saved.', 'ar'),
    8 => sprintf( __('FAQ submitted. <a target="_blank" href="%s">Preview FAQ</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
    9 => sprintf( __('FAQ scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview FAQ</a>', 'ar'),
      // translators: Publish box date format, see http://php.net/date
      date_i18n( __( 'M j, Y @ G:i', 'ar' ), strtotime( $post->post_date ) ), esc_url( get_permalink($post_ID) ) ),
    10 => sprintf( __('FAQ draft updated. <a target="_blank" href="%s">Preview FAQ</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
  );

  return $messages;
}
add_filter( 'post_updated_messages', 'faq_updated_messages' );
/**
 * Registering a post type called "Partner".
 */
function create_partner_type() {
	register_post_type( 'partner',
		array(
			'labels' => array(
				'name' => __( 'Partners', 'ar' ),
				'singular_name' => __( 'Partner', 'ar' ),
				'add_new' => _x( 'Add New Partner', 'partner', 'ar' ),
				'add_new_item' => __( 'Add New Partner', 'ar' ),
				'edit_item' => __( 'Edit Partner', 'ar' ),
				'new_item' => __( 'New Partner', 'ar' ),
				'all_items' => __( 'All Partner', 'ar' ),
				'view_item' => __( 'View Partner', 'ar' ),
				'search_items' => __( 'Search Partner', 'ar' ),
				'not_found' =>  __( 'No Partners found', 'ar' ),
				'not_found_in_trash' => __( 'No Partners found in Trash', 'ar' )
			),
			'publicly_queryable' => true,
			'show_ui' => true, 
			'show_in_menu' => true,
			'show_in_nav_menus' => true,
			'query_var' => true,
			'rewrite' => array( 'slug' => 'partner', 'with_front' => false ),
			'capability_type' => 'post',
			'has_archive' => true,
			'public' => true,
			'hierarchical' => false,
			'menu_position' => 5,
			'exclude_from_search' => false,
			'supports' => array( 'title', 'editor','thumbnail' )
		)
	);
}
add_action( 'init', 'create_partner_type' );

// add filter to ensure the text Issue, or issue, is displayed when user updates a issue 
function partner_updated_messages( $messages ) {
  global $post, $post_ID;

  $messages['partner'] = array(
    0 => '', // Unused. Messages start at index 1.
    1 => sprintf( __('Partner updated. <a href="%s">View Partner</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    2 => __('Custom field updated.', 'ar'),
    3 => __('Custom field deleted.', 'ar'),
    4 => __('Partner updated.', 'ar'),
    /* translators: %s: date and time of the revision */
    5 => isset($_GET['revision']) ? sprintf( __('Partner restored to revision from %s', 'ar'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
    6 => sprintf( __('Partner published. <a href="%s">View Partner</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    7 => __('Partner saved.', 'ar'),
    8 => sprintf( __('Partner submitted. <a target="_blank" href="%s">Preview Partner</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
    9 => sprintf( __('Partner scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview Partner</a>', 'ar'),
      // translators: Publish box date format, see http://php.net/date
      date_i18n( __( 'M j, Y @ G:i', 'ar' ), strtotime( $post->post_date ) ), esc_url( get_permalink($post_ID) ) ),
    10 => sprintf( __('Partner draft updated. <a target="_blank" href="%s">Preview Partner</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
  );

  return $messages;
}
add_filter( 'post_updated_messages', 'partner_updated_messages' );
/**
 * Registering a post type called "Promotion".
 */
function create_promotion_type() {
	register_post_type( 'promotion',
		array(
			'labels' => array(
				'name' => __( 'promotions', 'ar' ),
				'singular_name' => __( 'promotion', 'ar' ),
				'add_new' => _x( 'Add New promotion', 'promotion', 'ar' ),
				'add_new_item' => __( 'Add New promotion', 'ar' ),
				'edit_item' => __( 'Edit promotion', 'ar' ),
				'new_item' => __( 'New promotion', 'ar' ),
				'all_items' => __( 'All promotion', 'ar' ),
				'view_item' => __( 'View promotion', 'ar' ),
				'search_items' => __( 'Search promotion', 'ar' ),
				'not_found' =>  __( 'No promotions found', 'ar' ),
				'not_found_in_trash' => __( 'No promotions found in Trash', 'ar' )
			),
			'publicly_queryable' => true,
			'show_ui' => true, 
			'show_in_menu' => true,
			'show_in_nav_menus' => true,
			'query_var' => true,
			'rewrite' => array( 'slug' => 'promotion', 'with_front' => false ),
			'capability_type' => 'post',
			'has_archive' => true,
			'public' => true,
			'hierarchical' => false,
			'menu_position' => 5,
			'exclude_from_search' => false,
			'supports' => array( 'title', 'editor','thumbnail' )
		)
	);
}
add_action( 'init', 'create_promotion_type' );

// add filter to ensure the text Issue, or issue, is displayed when user updates a issue 
function promotion_updated_messages( $messages ) {
  global $post, $post_ID;

  $messages['promotion'] = array(
    0 => '', // Unused. Messages start at index 1.
    1 => sprintf( __('promotion updated. <a href="%s">View promotion</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    2 => __('Custom field updated.', 'ar'),
    3 => __('Custom field deleted.', 'ar'),
    4 => __('promotion updated.', 'ar'),
    /* translators: %s: date and time of the revision */
    5 => isset($_GET['revision']) ? sprintf( __('promotion restored to revision from %s', 'ar'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
    6 => sprintf( __('promotion published. <a href="%s">View promotion</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    7 => __('promotion saved.', 'ar'),
    8 => sprintf( __('promotion submitted. <a target="_blank" href="%s">Preview promotion</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
    9 => sprintf( __('promotion scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview promotion</a>', 'ar'),
      // translators: Publish box date format, see http://php.net/date
      date_i18n( __( 'M j, Y @ G:i', 'ar' ), strtotime( $post->post_date ) ), esc_url( get_permalink($post_ID) ) ),
    10 => sprintf( __('promotion draft updated. <a target="_blank" href="%s">Preview Promotions</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
  );

  return $messages;
}
add_filter( 'post_updated_messages', 'promotion_updated_messages' );
/**
 * Registering a post type called "Live Feed".
 */
function create_livefeed_type() {
	register_post_type( 'livefeed',
		array(
			'labels' => array(
				'name' => __( 'livefeeds', 'ar' ),
				'singular_name' => __( 'livefeed', 'ar' ),
				'add_new' => _x( 'Add New livefeed', 'livefeed', 'ar' ),
				'add_new_item' => __( 'Add New livefeed', 'ar' ),
				'edit_item' => __( 'Edit livefeed', 'ar' ),
				'new_item' => __( 'New livefeed', 'ar' ),
				'all_items' => __( 'All livefeed', 'ar' ),
				'view_item' => __( 'View livefeed', 'ar' ),
				'search_items' => __( 'Search livefeed', 'ar' ),
				'not_found' =>  __( 'No livefeeds found', 'ar' ),
				'not_found_in_trash' => __( 'No livefeeds found in Trash', 'ar' )
			),
			'publicly_queryable' => true,
			'show_ui' => true, 
			'show_in_menu' => true,
			'show_in_nav_menus' => true,
			'query_var' => true,
			'rewrite' => array( 'slug' => 'livefeed', 'with_front' => false ),
			'capability_type' => 'post',
			'has_archive' => true,
			'public' => true,
			'hierarchical' => false,
			'menu_position' => 5,
			'exclude_from_search' => false,
			'supports' => array( 'title', 'editor','thumbnail' )
		)
	);
}
add_action( 'init', 'create_livefeed_type' );

// add filter to ensure the text Issue, or issue, is displayed when user updates a issue 
function livefeed_updated_messages( $messages ) {
  global $post, $post_ID;

  $messages['livefeed'] = array(
    0 => '', // Unused. Messages start at index 1.
    1 => sprintf( __('livefeed updated. <a href="%s">View livefeed</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    2 => __('Custom field updated.', 'ar'),
    3 => __('Custom field deleted.', 'ar'),
    4 => __('livefeed updated.', 'ar'),
    /* translators: %s: date and time of the revision */
    5 => isset($_GET['revision']) ? sprintf( __('livefeed restored to revision from %s', 'ar'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
    6 => sprintf( __('livefeed published. <a href="%s">View livefeed</a>', 'ar'), esc_url( get_permalink($post_ID) ) ),
    7 => __('livefeed saved.', 'ar'),
    8 => sprintf( __('livefeed submitted. <a target="_blank" href="%s">Preview livefeed</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
    9 => sprintf( __('livefeed scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview livefeed</a>', 'ar'),
      // translators: Publish box date format, see http://php.net/date
      date_i18n( __( 'M j, Y @ G:i', 'ar' ), strtotime( $post->post_date ) ), esc_url( get_permalink($post_ID) ) ),
    10 => sprintf( __('livefeed draft updated. <a target="_blank" href="%s">Preview Livefeed</a>', 'ar'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
  );

  return $messages;
}
add_filter( 'post_updated_messages', 'livefeed_updated_messages' );
/*template used*/
add_action('wp_head', 'show_template');
function show_template() {
	global $template;
	//print_r($template);
}
/**
 * Options Tree.
 */
 
/**
 * Optional: set 'ot_show_pages' filter to false.
 * This will hide the settings & documentation pages.
 */
add_filter( 'ot_show_pages', '__return_false' );

/**
 * Optional: set 'ot_show_new_layout' filter to false.
 * This will hide the "New Layout" section on the Theme Options page.
 */
add_filter( 'ot_show_new_layout', '__return_false' );

/**
 * Required: set 'ot_theme_mode' filter to true.
 */
add_filter( 'ot_theme_mode', '__return_true' );

/**
 * Required: include OptionTree.
 */
include_once( trailingslashit( get_template_directory() ) . 'option-tree/ot-loader.php' );

include_once( trailingslashit( get_template_directory() ) . 'inc/theme-options.php' );


function wpbeginner_numeric_posts_nav() {


	global $wp_query;

	/** Stop execution if there's only 1 page */
	if( $wp_query->max_num_pages <= 1 )
		return;

	$paged = get_query_var( 'paged' ) ? absint( get_query_var( 'paged' ) ) : 1;
	$max   = intval( $wp_query->max_num_pages );

	/**	Add current page to the array */
	if ( $paged >= 1 )
		$links[] = $paged;

	/**	Add the pages around the current page to the array */
	if ( $paged >= 3 ) {
		$links[] = $paged - 1;
		$links[] = $paged - 2;
	}

	if ( ( $paged + 2 ) <= $max ) {
		$links[] = $paged + 2;
		$links[] = $paged + 1;
	}

	echo '<div class="navigation"><ul>' . "\n";

	/**	Previous Post Link 
	if ( get_previous_posts_link() )
		printf( '<li>%s</li>' . "\n", get_previous_posts_link() );

	/**	Link to first page, plus ellipses if necessary */
	if ( ! in_array( 1, $links ) ) {
		$class = 1 == $paged ? ' class="active"' : '';

		printf( '<li%s><a href="%s">%s</a></li>' . "\n", $class, esc_url( get_pagenum_link( 1 ) ), '1' );

		if ( ! in_array( 2, $links ) )
			echo '<li>…</li>';
	}

	/**	Link to current page, plus 2 pages in either direction if necessary */
	sort( $links );
	foreach ( (array) $links as $link ) {
		$class = $paged == $link ? ' class="active"' : '';
		printf( '<li%s><a href="%s">%s</a></li>' . "\n", $class, esc_url( get_pagenum_link( $link ) ), $link );
	}

	/**	Link to last page, plus ellipses if necessary */
	if ( ! in_array( $max, $links ) ) {
		if ( ! in_array( $max - 1, $links ) )
			echo '<li>…</li>' . "\n";

		$class = $paged == $max ? ' class="active"' : '';
		printf( '<li%s><a href="%s">%s</a></li>' . "\n", $class, esc_url( get_pagenum_link( $max ) ), $max );
	}

	/**	Next Post Link 
	if ( get_next_posts_link() )
		printf( '<li>%s</li>' . "\n", get_next_posts_link() );*/

	echo '</ul></div>' . "\n";

}


function example_ajax_request() {
       if (isset($_REQUEST)) {
		if(!filter_var($_REQUEST['email'], FILTER_VALIDATE_EMAIL))
  		{
  			echo "E-mail is not valid";
  		}
		else
  		{
  			if( null == username_exists( $_REQUEST['email']) ) {
			  // Generate the password and create the user
			  $password = wp_generate_password( 12, false );
			  $user_id = wp_create_user(  $_REQUEST['email'], $password,  $_REQUEST['email'] );

			  // Set the nickname
			  wp_update_user(
			    array(
			      'ID'          =>    $user_id,
			      'nickname'    =>     $_REQUEST['email']
			    )
			  );

			  // Set the role
			  $user = new WP_User( $user_id );
			  $user->set_role( 'subscriber' );

			  // Email the user
			  wp_mail( $email_address, wp_title(), 'Thank you for subscribing with us!' );

			}else{
				echo "You are already our subscriber" ;
			}
  		}
	}
   die();
}
add_action( 'wp_ajax_example_ajax_request', 'example_ajax_request' );
// If you wanted to also use the function for non-logged in users (in a theme for example)
add_action( 'wp_ajax_nopriv_example_ajax_request', 'example_ajax_request' );

