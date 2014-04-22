<?php
/**
 * Template name: Home Page Template 
 * The template for displaying about pages.
 */

get_header('headername');
?>
<div class="tcontainer clearfix">		
	<div class="right">
		<div class="hedr">
			<h1 class="typeface-js" style="font-family: Tahoma;font-weight:normal;"><a href="<?php echo site_url('/blog/')?>" style="text-decoration:none;color:#fff;"><?php _e('المدونة','aramas')?></a></h1>
		</div>
		<div class="content">
			<div class="slidewrap">
				<ul class="slider">
				  <?php 
			              $temp_post = $post;
			              $wp_query = new WP_Query(); $wp_query->query('post_type=post');
			              while ($wp_query->have_posts()) : $wp_query->the_post();
			              ?>
				<li class="slide">
						<a href="<?php echo site_url('/blog/')?>"><?php echo get_the_post_thumbnail($post->ID, 'full-size'); ?></a>	
						<div class="po">
						<h2><a href="<?php echo site_url('/blog/')?>" style="text-decoration:none;color:#111;font-size:20px;"><?php echo get_the_title();?></a></h2>
						<a href="<?php echo site_url('/blog/')?>" style="text-decoration:none;color:#111;"><p><?php the_excerpt();?></p></a>
						</div>
					</li>
				 <?php
			              endwhile;
			              $post = $temp_post;
			            ?> 	
				</ul>
				<ul class="slidecontrols">
					<li><a href="#carousel-1-0" class="carousel-prev"></a></li>
					<li><a href="#carousel-1-0" class="carousel-next"></a></li>
				</ul>
			</div>
		</div>
	</div>
	<div class="left">
		<div class="c2">
				<div class="slidewrap4" data-autorotate="4000">
			      <ul class="slider">
			       <?php 
			              $temp_post = $post;
			              $wp_query = new WP_Query(); $wp_query->query('post_type=service');
			              while ($wp_query->have_posts()) : $wp_query->the_post();
			              ?>
			        <?php if(get_the_post_thumbnail($post->ID,'full-size')) {?>
			        <li class="slide">  
			          <a href="<?php echo  get_permalink( $post->ID );?>"><?php echo get_the_post_thumbnail($post->ID,'full-size');?></a>
			        </li>
			        <?php } ?>
			        <?php
			              endwhile;
			              $post = $temp_post;
			            ?> 
			      </ul>
			      <ul class="slidecontrols" role="navigation">  
			        <li role="presentation">
			          <a href="#carousel-4-0" class="as-next"></a>
			        </li> 
			          <li role="presentation">
			            <a href="#carousel-4-0" class="as-prev"></a>
			          </li>
			        </ul>
  				</div>
		</div>
		<div class="c1">
		   <div class="slidewrap20" data-autorotate="4000">
		      <ul class="slider">
		       <?php 
		              $temp_post = $post;
		              $wp_query = new WP_Query(); $wp_query->query('post_type=promotion');
		              while ($wp_query->have_posts()) : $wp_query->the_post();
		              ?>
		        <li class="slide">  
		          <a href='<?php echo site_url('/about_us/')?>'><?php echo get_the_post_thumbnail($post->ID,'full-size');?></a>
		        </li>
		        <?php
		              endwhile;
		              $post = $temp_post;
		            ?> 
		      </ul>
		      <ul class="slidecontrols" role="navigation">  
		        <li role="presentation">
		          <a href="#carousel-4-0" class="as-next"></a>
		        </li> 
		          <li role="presentation">
		            <a href="#carousel-4-0" class="as-prev"></a>
		          </li>
		        </ul>
				</div>
		</div>
		<div class="c3">
				<div class="slidewrap4" data-autorotate="5000">
			      <ul class="slider">
			       <?php 
			              $temp_post = $post;
			              $wp_query = new WP_Query(); $wp_query->query('post_type=faq');
			              while ($wp_query->have_posts()) : $wp_query->the_post();
			              ?>
			        <li class="slide">  
			          <h1><a href="<?php echo site_url('/faqs/')?>" style="text-decoration:none;color:#111;"><?php the_title();?></a></h1>
			          <p><a href="<?php echo site_url('/faqs/')?>" style="text-decoration:none;color:#111;"><?php the_excerpt();?></a></p>
			        </li>
			        <?php
			              endwhile;
			              $post = $temp_post;
			            ?> 
			      </ul>
			      <ul class="slidecontrols" role="navigation">  
			        <li role="presentation">
			          <a href="#carousel-4-0" class="as-next"></a>
			        </li> 
			          <li role="presentation">
			            <a href="#carousel-4-0" class="as-prev"></a>
			          </li>
			        </ul>
  				</div>
		</div>
		<div class="c4">
			<div class="l">
			<h1 class="typeface-js" style="font-family: Tahoma;font-weight: normal;"><img src="<?php echo IMAGES?>/live_feeds.png" style="max-width: 100%;float: right;"></h1>
			</div>
			<div class="r">
			<div class="slidewrap4" data-autorotate="4000">
			      <ul class="slider">
			       <?php 
			              $temp_post = $post;
			              $wp_query = new WP_Query(); $wp_query->query('post_type=livefeed');
			              while ($wp_query->have_posts()) : $wp_query->the_post();
			              ?>
			        <li class="slide">  
			          <p>
			          	<?php $myExcerpt = get_the_content();
						  $tags = array("<p>", "</p>");
						  $myExcerpt = str_replace($tags, "", $myExcerpt);
						  echo $myExcerpt;?></p>
			        </li>
			        <?php
			              endwhile;
			              $post = $temp_post;
			            ?> 
			      </ul>
			      <ul class="slidecontrols" role="navigation">  
			        <li role="presentation">
			          <a href="#carousel-4-0" class="as-next"></a>
			        </li> 
			          <li role="presentation">
			            <a href="#carousel-4-0" class="as-prev"></a>
			          </li>
			        </ul>
  				</div>
  			</div>	
		</div>
		<div class="c5">
			<div class="col">
				<div id="owl-demo3" class="owl-carousel owl-theme">
			       <?php 
			              global $post;$temp_post = $post;
			              $wp_query = new WP_Query(); $wp_query->query('post_type=partner');
			              while ($wp_query->have_posts()) : $wp_query->the_post();
			              ?>
			        <div class="item">  
			         <a href="<?php echo site_url('/partners/')?>"> <img src="<?php echo get_field('home_page_image',$post->ID); ?>"></a>
			        </div>
			        <?php
			              endwhile;
			              $post = $temp_post;
			            ?> 
  				</div>
			</div>
			<div class="div"></div>
			<div class="col">
				<img src="<?php echo IMAGES;?>/slider_partner_title.png" style="max-width: 100%;float: right;margin-top: -2px;">
			</div>
		</div>
	</div>
</div>
<?php get_footer();?>