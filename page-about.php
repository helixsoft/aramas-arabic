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
				<div class="left"><h1  style="font-weight: normal;"><img src="<?php echo IMAGES?>/left_box.png" ></h1><p><?php echo ot_get_option( 'aboutus_mission_sub_heading' );?></p></div>
				<div class="right"><h1 style="font-weight: normal;"><img src="<?php echo IMAGES?>/right_box.png" style="margin-top: 5px;margin-bottom: 5px;"></h1><p><?php echo ot_get_option( 'aboutus_vision_sub_heading' );?></p></div>		
			</div>
			<div class="bottom">
				<h1 class="typeface-js" style="font-family: Tahoma;font-weight: normal;"><?php echo ot_get_option( 'groups_creator' );?></h1>
				<p><?php echo ot_get_option( 'groups_creator_content' );?></p>
				<a href="<?php echo site_url('/contact/')?>"><img src="<?php echo THEMEROOT?>/images/contact_us.png"></a>
			</div>
		</div>
</div>	
<?php endwhile;?>
<?php get_footer();?>