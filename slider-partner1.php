<div id="wrapper">
        <div id="owl-demo2" class="owl-carousel owl-theme">
         <?php 
                    $temp_post = $post;
                    $wp_query = new WP_Query(); $wp_query->query('post_type=partner');
                    while ($wp_query->have_posts()) : $wp_query->the_post();
                    ?>
          <?php
          $thumb_id = get_post_thumbnail_id();
          $thumb_url = wp_get_attachment_image_src($thumb_id,'full', true);
          ?>
          <div class="item"><a class="fancybox" href="#inline<?php echo the_ID();?>"><img src="<?php echo get_field('big_image')?>" /></a>
            <div id="inline<?php echo the_ID();?>" style="width:800px!important;height:auto;display: none;">
              <div class="full">
                <div class="half">
                  <h1>إعرف المزيد</h1>
                  <div class="move_down">
                  <p><?php echo the_content();?></p>
                  </div>
                  <a href="<?php echo get_field('website_link')?>" target="_blank" style="text-decoration:none;float:left;"><h4 style="margin:0;">قم بزيارة موقعنا</h4></a>
                </div>
              </div>
            </div>
          </div>
          <?php
                  endwhile;
                  $post = $temp_post;
              ?> 
              </div>
    </div>