<?php
/**
 * Template name: Services Page Template 
 * The template for displaying service pages.
 */
get_header('service'); ?>			
<div class="scontainer clearfix">		
	     <?php global $wp_query; ?>
		 <?php  $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;?>
		 <?php $wp_query = new WP_Query(array('post_type'=>'service',
			'posts_per_page'=>6,
			'post_status'=>'publish','paged'=> $paged)); 
		 ?>
				<div class="nav-area-service">
		  	<?php wpbeginner_numeric_posts_nav(); ?>
		  </div>
		<nav>			
			<ul>

          <?php if ( have_posts() ) : ?>
          <?php /* Start the Loop */ ?>
          <?php while ( have_posts() ) : the_post(); ?>
				<li class="over"><a href="<?php echo get_permalink($post->ID)?>"><?php echo get_the_post_thumbnail($post->ID,'slider-container') ?></a></li>	
		  <?php endwhile;endif;?>
			</ul>
		</nav>  

</div>
<?php get_footer();?>