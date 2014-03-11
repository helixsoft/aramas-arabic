<?php
/**
 * Template name: Group Page Template 
 * The template for displaying about pages.
 */

get_header('about'); ?>
<?php /* The loop */ ?>
<?php while ( have_posts() ) : the_post(); ?>
<div class="acontainer clearfix">		
		<div class="content">
			<div class="top">
				<div class="left"><h1><?php echo ot_get_option( 'aboutus_vision_heading' );?></h1><p><?php echo ot_get_option( 'aboutus_vision_sub_heading' );?></p></div>
				<div class="right"><h1><?php echo ot_get_option( 'aboutus_mission_heading' );?></h1><p><?php echo ot_get_option( 'aboutus_mission_sub_heading' );?></p></div>
			</div>
			<div class="bottom">
				<h1><?php echo ot_get_option( 'groups_creator' );?></h1>
				<p><?php echo ot_get_option( 'groups_creator_content' );?></p>
				<a href="<?php echo site_url('/contact/')?>"><img src="<?php echo THEMEROOT?>/images/contact_us.png"></a>
			</div>
		</div>
</div>	
<?php endwhile;?>
<?php get_footer();?>