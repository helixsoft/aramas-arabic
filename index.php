<?php
/**
 * The main template file.
 */
get_header(); ?>		
<div class="bcontainer">		
		<div class="blogcontent">
			<div class="bleft">	
			         <?php global $wp_query; ?>
				 <?php  $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;?>
				 <?php $wp_query = new WP_Query(array(
					'posts_per_page'=>-1,
					'post_status'=>'publish','paged'=> $paged)); 
				 ?>	
			<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>	
				<div class="blogimg" id="<?php echo the_ID();?>">
					<?php echo get_the_post_thumbnail($post->ID, 'small-container'); ?>
					<h2><?php the_author();?></h2>
					<h3><?php echo get_the_date('d-m-Y'); ?></h3>
				</div>	
			 <?php endwhile;endif; ?>	
			</div>			
				
			<?php $i=0;if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>	
			<div class="bright <?php echo $i==0 ? 'active':''?>" id="<?php echo the_ID();?>">
				<h1><?php echo get_the_title();?></h1>
				<div class="bimage"><?php echo get_the_post_thumbnail($post->ID, 'slider-container'); ?></div>
				<div class="bartist"><?php _e('By','ar'); echo " : "; the_author();  echo " | "; echo get_the_date('d-m-Y'); ?></div>
				<div class="bcontent"><?php the_content();?></div>
			</div>	
			<?php $i++;endwhile;endif; ?>	
		</div>
</div>
<?php get_footer();?>