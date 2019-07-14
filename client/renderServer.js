import React from 'react';


function renderInitialState(preloadedState) {
  return `window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}`;
}


export default (context, content, helmet, css, preloadedState, styledComponentsTags) => `<!DOCTYPE html>
  <html>
    <head>
      
      ${helmet.title.toString()}
      ${helmet.meta.toString()}     
      ${helmet.link.toString()}    
      
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />      
      <meta name='wmail-verification' content='735052fe6de0962e32499e201fd32a7a' />

      <link rel="stylesheet" href="/css/style.css" />
      <link rel="stylesheet" href="/css/image-gallery.css" />    
      <link rel="stylesheet" href="/css/rc-slider.css" />    
      <link rel="stylesheet" href="/css/react-day-picker.css" />    
      <link rel="stylesheet" href="/css/rich-editor.css" />    
      <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />      
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" async>         
      
      <!-- Global site tag (gtag.js) - Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=UA-113317461-1"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-113317461-1');
      </script>

      <!-- Yandex.Metrika counter -->
      <script type="text/javascript" >
          (function (d, w, c) {
              (w[c] = w[c] || []).push(function() {
                  try {
                      w.yaCounter49054385 = new Ya.Metrika({
                          id:49054385,
                          clickmap:true,
                          trackLinks:true,
                          accurateTrackBounce:true,
                          webvisor:true
                      });
                  } catch(e) { }
              });

              var n = d.getElementsByTagName("script")[0],
                  s = d.createElement("script"),
                  f = function () { n.parentNode.insertBefore(s, n); };
              s.type = "text/javascript";
              s.async = true;
              s.src = "https://mc.yandex.ru/metrika/watch.js";

              if (w.opera == "[object Opera]") {
                  d.addEventListener("DOMContentLoaded", f, false);
              } else { f(); }
          })(document, window, "yandex_metrika_callbacks");
      </script>      
 
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js" async defer=""></script>  
    </head>

    <body>
      <noscript><div><img src="https://mc.yandex.ru/watch/49054385" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
      <!-- /Yandex.Metrika counter -->
      
      <script type="text/javascript" async>
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/59c2723ac28eca75e462133f/default';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
      </script>

      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDCmnzoXYYCTi6ifKE4Bf4VvKjGQPCN-I4&libraries=places"
        async defer></script> 
      
      <script src="https://use.fontawesome.com/cab9ef1c5f.js" async></script>
      <script async>
        window.fbAsyncInit = function() {
          FB.init({
            appId            : '123715308261227',
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v2.10'
          });
          FB.AppEvents.logPageView();
        };

        (function(d, s, id){
           var js, fjs = d.getElementsByTagName(s)[0];
           if (d.getElementById(id)) {return;}
           js = d.createElement(s); js.id = id;
           js.src = "https://connect.facebook.net/en_US/sdk.js";
           fjs.parentNode.insertBefore(js, fjs);
         }(document, 'script', 'facebook-jssdk'));
      </script> 

      <div id="root">${content}</div>
      
      <script>
        window.splitPoints=${JSON.stringify(context.splitPoints)}; // Send it down to the client
      </script>

      <style>${styledComponentsTags}</style>

      <script>${preloadedState && renderInitialState(preloadedState)}</script>
      <script src="/static/bundle.js"></script>
    </body>
  </html>`;

   
