'use strict';

export default class  Login {
        constructor() {
            this.render();
        }
        render() {
            document.body.innerHTML = `  <div class="login">
                                           <header class="header">
                                               <div class="header__logo">chat app</div>
                                               <h1 class="header__welcome">Welcome to chat app</h1>
                                           </header>
                                           <form class="form" action="">
                                               <input class="form__username" type="text" placeholder="Username" autofocus autocomplete="current-password"
>
                                               <input class="form__password" type="password" placeholder="Password">
                                               <button class="form__sigh-in">Sign In</button>
                                           </form>
                                            <footer class="footer">Don't have account? <span class="footer__sigh-up">Sigh Up</span></footer>
                                
                                         </div>`
        }

}
new Login();