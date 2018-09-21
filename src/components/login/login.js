'use strict';


class Chat {
    constructor(contactname,path,username,gender) {
        this.contactname = contactname;
        this.username = username;
        this.path = path;
        this.gender = gender;
        this.contactPath = null;
        this.render();
        this.getMessages();
        this.contactGender = null;
    }

    render() {
        document.body.innerHTML =`<div class="chat">
                                        <nav class="navigation">
                                              <ul class="navigation__list">
                                                <li class="navigation__item-back"></li>
                                                <li class="navigation__item-contactname">${this.contactname}</li>
                                                <li class="navigation__item-more"></li>
                                                <ul class="more">
                                                    <li class="more__clean-chat">Очистить чат</li>
                                                    <li class="more__delete-contact">Удалить контакт</li>
                                                </ul>
                                               </ul>
                                        </nav>
                                          
                                        <main class="main">
                                            <ul class="main__message-list"></ul>
                                        </main>
                                        <form class="type-message">
                                            <input class="type-message__type-text" type="text" placeholder="Type message..." autofocus>
                                            <button class="type-message__send-message">Send</button>
                                        </form>
                                    </div>`;

        document.querySelector('.type-message__type-text').focus();

        let back = document.querySelector('.navigation__item-back');
        back.addEventListener('click',() =>{
            clearInterval(this.intervalGetMessages);
            new Contacts(this.username,this.path,this.gender);
        });


        let more = document.querySelector('.navigation__item-more');
        more.addEventListener('click',() =>{
            document.querySelector('.more').style.display = 'flex';
        });
        let cleanChat = document.querySelector('.more__clean-chat');
        cleanChat.addEventListener('click',() =>{
            this.cleanChat();
            document.querySelector('.more').style.display = 'none';
        });

        let deleteContact = document.querySelector('.more__delete-contact');
        deleteContact.addEventListener('click',() =>{
            clearInterval(this.intervalGetMessages);
            this.deleteContact();

        });

        this.getContactPath();
        let buttonSend = document.querySelector('.type-message__send-message');
        buttonSend.addEventListener('click', this.sendMessage.bind(this));

        this.intervalGetMessages = setInterval(() => {
            this.getMessages();
        },1000)
    }

    getMessages() {

        let xhrGetMessages = new XMLHttpRequest();
        xhrGetMessages.open('Get',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts/${this.contactname}.json`, true);
        xhrGetMessages.send();

        xhrGetMessages.onload = () => {
            let messageList = document.querySelector('.main__message-list');
            if (JSON.parse(xhrGetMessages.responseText)!== null) {
                let messages = Object.values(JSON.parse(xhrGetMessages.responseText));
                this.contactGender = messages[0].gender;

                function renderMessage() {
                    messageList.innerHTML = '';
                    for (let message of messages) {
                        let messagesItem = document.createElement('li');
                        let messageClassName = (message.from !== this.username) ? 'message-from-contact' : 'message-from-user';
                        messagesItem.classList.add(messageClassName);
                        messageList.append(messagesItem);

                        let textMessage = document.createElement('span');
                        textMessage.classList.add('text-message');
                        textMessage.innerHTML = message.text;
                        messagesItem.append(textMessage);

                        let timeMessage = document.createElement('span');
                        timeMessage.classList.add('time-message');
                        timeMessage.innerHTML = message.date;
                        messagesItem.append(timeMessage);
                    }
                    messageList.scrollTop = 9999999999999999999999999;
                }

                if (messages.length!== this.countMessages) renderMessage.call(this);
                this.countMessages = messages.length;
            }


        }

    }

    sendMessage(event) {
        event.preventDefault();
        let textMessage = document.querySelector('.type-message__type-text');
        let minuteNow = ( (new Date).getMinutes() < 10 )? '0'+ (new Date).getMinutes() : (new Date).getMinutes();
        let messageForUser = {
            text: textMessage.value,
            from: this.username,
            date: new Date().getHours()+':'+ minuteNow + '  ' + new Date().getDate()+'.'+new Date().getFullYear(),
            gender: this.gender
        }
        if( textMessage.value !== '' ) {
            let xhrSendMessageForUser = new XMLHttpRequest();
            xhrSendMessageForUser.open('POST',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts/${this.contactname}.json`, true);
            xhrSendMessageForUser.send(JSON.stringify(messageForUser));
            let xhrSendMessageForContact = new XMLHttpRequest();
            xhrSendMessageForContact.open('POST',`https://chat-91ad3.firebaseio.com/userdata/${this.contactPath}/contacts/${ this.username }.json`, true);
            xhrSendMessageForContact.send(JSON.stringify(messageForUser));
        }
        textMessage.value =  '';
        textMessage.focus();
    }

    getContactPath() {
        let xhrContactPath = new XMLHttpRequest();
        xhrContactPath.open('GET','https://chat-91ad3.firebaseio.com/users.json',true);
        xhrContactPath.send();
        xhrContactPath.onload = () => {
          let users = Object.values(JSON.parse(xhrContactPath.responseText));
          for( let user of users) {
              if (user.username === this.contactname) {
                  this.contactPath = user.path;
              }
          }
        }
    }

    cleanChat() {
        let xhrDeleteChat = new XMLHttpRequest();
        xhrDeleteChat.open('DELETE',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts/${this.contactname}.json`, true);
        xhrDeleteChat.send();
        xhrDeleteChat.onload = () => {
            let xhrSendMessageCleanChat = new XMLHttpRequest();
            xhrSendMessageCleanChat.open('POST',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts/${this.contactname}.json`, true);
            let minuteNow = ((new Date).getMinutes()<10)? '0'+ (new Date).getMinutes() : (new Date).getMinutes()
            let messageCleanChat = {
                text: 'Чат очищен',
                date: (new Date).getHours() + ':' + minuteNow + '  ' + (new Date).getDate() + '.' + (new Date).getFullYear(),
                from: this.username,
                gender: this.contactGender

            }
            xhrSendMessageCleanChat.send(JSON.stringify(messageCleanChat));
        }


    }

    deleteContact() {
        let xhrDeleteChat = new XMLHttpRequest();
        xhrDeleteChat.open('DELETE',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts/${this.contactname}.json`, true);
        xhrDeleteChat.send();
        xhrDeleteChat.onload = () => {
            new Contacts(this.username,this.path,this.gender);
        }


    }

}





class Contacts {
    constructor(username,path,gender) {
        this.username = username;
        this.path = path;
        this.gender = gender;
        this.contactGender;
        this.render();
        this.getContacts();

    }
    render() {
        document.body.innerHTML = `<div class="contacts">
                                        <nav class="navigation">
                                            <ul class="navigation__list">
                                                 <li class="navigation__item-exit">
                                                <li class="navigation__item-contacts">${this.username} - contact list</li>
                                                <li class="navigation__item-add">
                                                    <span class="item-add__line"></span>
                                                </li>
                                            </ul>
                                        </nav>
                                       <form class="add-contact">
                                              <div>
                                                  <input class="add-contact__name" type="text" placeholder="Contact name">
                                                  <button class="add-contact__button">Add</button>
                                              </div>
                                            <span class="add-contact__error">У вас уже есть такой контакт</span>
                                        </form>
                                        <main class="main">                         
                                            <ul class="main__contact-list">                                          
                                            </ul>
                                        </main>
                                   </div>`;


        let exit = document.querySelector('.navigation__item-exit');
        exit.addEventListener('click', () => {
            clearInterval(this.intervalGetContacts);
            new Login();
        });

        let formAddContact = document.querySelector('.add-contact')
        formAddContact.style.display = 'none';

        document.querySelector('.main').addEventListener('click',() => {
            formAddContact.style.display = 'none';
        })

        let addContact = document.querySelector('.navigation__item-add');
        addContact.addEventListener('click', () => {
            formAddContact.style.display = 'flex';
            document.querySelector('.add-contact__name').focus();
        });

        let contactName = document.querySelector('.add-contact__name');
        document.querySelector('.add-contact__button').addEventListener('click', this.addContact.bind(this));

       this.intervalGetContacts = setInterval(() => {
            this.getContacts();
        },1000)

    }

    addContact(event) {
        event.preventDefault();
        let pathContact;
        let userName = document.querySelector('.add-contact__name').value;
        if(userName === this.username) {
            document.querySelector('.add-contact__error').style.display ='inline';
            document.querySelector('.add-contact__error').innerHTML = 'Вы не можете добавлять самого себя';
        }

        else {
            if (userName === '') {
                document.querySelector('.add-contact__error').style.display ='inline';
                document.querySelector('.add-contact__error').innerHTML = 'Поле не должно быть пустым';
            }

            else {
                    let xhrGetContactPath = new XMLHttpRequest();
                    xhrGetContactPath.open('GET',`https://chat-91ad3.firebaseio.com/users.json`, true);
                    xhrGetContactPath.send();
                    xhrGetContactPath.onload =  () => {
                        let users = Object.values(JSON.parse(xhrGetContactPath.responseText));
                        let userCounter = 0

                        for(let user of users) {
                            if ( user.username === userName ) {
                                userCounter++;
                                pathContact = user.path;

                            }
                        }
                        if(userCounter === 0) {
                            document.querySelector('.add-contact__error').style.display ='inline';
                            document.querySelector('.add-contact__error').innerHTML = 'Нет такого пользователя';
                        }

                        else {

                            let xhrGetContacts  = new XMLHttpRequest();
                            xhrGetContacts.open('GET',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts.json`, true);
                            xhrGetContacts.send();
                            xhrGetContacts.onload =  () => {
                                let contactCounter = 0;

                                if(JSON.parse(xhrGetContacts.responseText) !== null) {
                                    let contacts = Object.keys(JSON.parse(xhrGetContacts.responseText));

                                    for( let contact of contacts) {
                                        if(userName === contact ) {contactCounter++}
                                    }
                                }


                                if (contactCounter!==0) {
                                    document.querySelector('.add-contact__error').style.display ='inline';
                                    document.querySelector('.add-contact__error').innerHTML = 'У вас уже есть этот контакт';
                                }

                                else{
                                    let xhrGetContactInfo  = new XMLHttpRequest();
                                    xhrGetContactInfo.open('GET',`https://chat-91ad3.firebaseio.com/userdata/${pathContact}.json`, true);
                                    xhrGetContactInfo.send();
                                    xhrGetContactInfo.onload =  () => {
                                        let contactData = JSON.parse(xhrGetContactInfo.responseText);
                                        let minuteNow = ((new Date).getMinutes() < 10)? '0'+ (new Date).getMinutes() : (new Date).getMinutes();

                                        let contact ={
                                            text: 'Вы добавили новый контакт',
                                            date: (new Date).getHours()+':'+ minuteNow +'  ' +(new Date).getDate()+'.'+(new Date).getFullYear(),
                                            from: this.username,
                                            gender: contactData.gender
                                        }

                                        let xhrAddContactForUser = new XMLHttpRequest();
                                        xhrAddContactForUser.open('POST',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts/${contactData.username}.json`, true);
                                        xhrAddContactForUser.send(JSON.stringify(contact));
                                        xhrAddContactForUser.onload = () => {

                                            let minuteNow = ((new Date).getMinutes()< 10)? '0'+ (new Date).getMinutes() : (new Date).getMinutes();

                                            let user = {
                                                text: 'К вам добавился новый контакт',
                                                date: (new Date).getHours() + ':' + minuteNow + '  ' + (new Date).getDate() + '.' + (new Date).getFullYear(),
                                                from: this.username,
                                                gender: this.gender
                                            }

                                            let xhrAddUserForContact = new XMLHttpRequest();
                                            xhrAddUserForContact.open('POST',`https://chat-91ad3.firebaseio.com/userdata/${pathContact}/contacts/${this.username}.json`, true);
                                            xhrAddUserForContact.send(JSON.stringify(user));
                                            xhrAddUserForContact.onload = () => {

                                            }


                                            document.querySelector('.add-contact').style.display = 'none';
                                            this.getContacts();

                                        }
                                    }
                                }



                            }

                        }




                    }
                }
        }





    }

    getContacts() {
        let xhrGetContacts = new XMLHttpRequest();
        xhrGetContacts.open('GET',`https://chat-91ad3.firebaseio.com/userdata/${this.path}/contacts.json`, true);
        xhrGetContacts.send();

        xhrGetContacts.onload = () => {
           if(JSON.parse(xhrGetContacts.responseText) !== null) {
               let contacts = JSON.parse(xhrGetContacts.responseText);
               let contactList = document.querySelector('.main__contact-list');
               contactList.innerHTML = '';

               for(let contact in contacts) {
                   let messages = Object.values(contacts[contact]);

                   let contactListItem = document.createElement('li');
                   contactListItem.classList.add('contact__list-item');
                   contactList.append(contactListItem);

                   contactListItem.addEventListener('click', () => {

                       new Chat(contact,this.path,this.username,this.gender);
                       clearInterval(this.intervalGetContacts);
                   })

                   let  itemContact = document.createElement('div');
                   itemContact.classList.add('item__contact');
                   contactListItem.append(itemContact);

                   let itemAvatar = document.createElement('img');
                   itemAvatar.classList.add('item__avatar');
                   itemAvatar.setAttribute('src',`./src/components/images/user_${Object.values(contacts[contact])[0].gender}_default.png`);
                   itemContact.append(itemAvatar);

                   let  itemMessage = document.createElement('ul');
                   itemMessage.classList.add('item_message');
                   itemContact.append(itemMessage);

                   let  itemUsername = document.createElement('li');
                   itemUsername.classList.add('item__username');
                   itemUsername.innerHTML = contact;
                   itemMessage.append(itemUsername)

                   let  itemTextMessage = document.createElement('li');
                   itemTextMessage.classList.add('item__text-message');
                   itemTextMessage.innerHTML = messages[messages.length - 1].text;
                   itemMessage.append(itemTextMessage);

                   let  itemDate = document.createElement('span');
                   itemDate.classList.add('item__date');
                   itemDate.innerHTML = messages[messages.length - 1].date;
                   contactListItem.append(itemDate);
               }
           }
        }
    }

}





class CreateAccount {
    constructor() {
        this.render();

    }

    render() {
        document.body.innerHTML = ` <div class="create-account">
                                        <header class="header">
                                            <div class="header__logo">chat app</div>
                                            <h1 class="header__welcome">Welcome to chat app</h1>
                                        </header>
                                         <span class="error-username">Длина имени  должна быть не менее 3 символов</span>
                                         <span class="error-password">Пароль не должен быть пустым</span>
                                         <span class="error-gender">Выберете пол</span>
                                          <div class="successful-registration">
                                                <span>Вы успешно зарегистрированы!</span>
                                                <span>Пожалуйста  войдите.</span>
                                                <form action="">
                                                    <button class="successful-registration__button">Login</button>
                                                </form>
                                           </div>
                                        <form class="form" action="">
                                            <input class="form__username" type="text" placeholder="Username" autofocus>
                                            <input class="form__password" type="password" placeholder="Password">
                                           <div class="form__gender">
                                               <label for="gender-male">Male</label>
                                               <input id ="gender-male" name="gender" class="form__gender--male" type="radio" >
                                           </div>
                                
                                            <div class="form__gender">
                                                <label for="gender-female">Female</label>
                                                <input id ="gender-female" name="gender" class="form__gender--female" type="radio" >
                                            </div>
                                            <button class="form__sigh-up">Sign Up</button>
                                        </form>
                                        <footer class="footer">Have account? <span class="footer__sigh-in">Sigh In</span></footer>
                                    </div>`;

        document.querySelector('.error-username').style.display ='none';
        document.querySelector('.error-password').style.display ='none';
        document.querySelector('.error-gender').style.display ='none';
        document.querySelector('.successful-registration').style.display ='none';
        document.querySelector('.form__username').focus();

        let sighIn = document.querySelector('.footer__sigh-in');
        sighIn.addEventListener( 'click', () => {new Login();} );

        let sighUp = document.querySelector('.form__sigh-up');
        sighUp.addEventListener( 'click', this.checkout.bind(this));
    }

    checkout(event){
        let self = this;
        event.preventDefault();

        document.querySelector('.error-username').style.display ='none';
        document.querySelector('.error-password').style.display ='none';
        document.querySelector('.error-gender').style.display ='none';

        let userName = document.querySelector('.form__username').value;
        let userPassword = document.querySelector('.form__password').value;

        let male = document.querySelector('.form__gender--male');
        let female = document.querySelector('.form__gender--female');
        
        let userGender = male.checked ? 'M' :
                         female.checked ? 'F' :
                         null;

        checkUserName(userName);

        function checkUserName(userName) {
            if(userName.length < 3) {
                document.querySelector('.error-username').style.display ='inline';
                document.querySelector('.error-username').innerHTML = 'Имя не должно быть меньше 3-х символов';
                return false;
            }

            else if(checkPassword(userPassword) && checkGender(userGender)) {
                let xhrUsername = new XMLHttpRequest();
                xhrUsername.open('GET','https://chat-91ad3.firebaseio.com/users.json', true);
                xhrUsername.send();


                xhrUsername.onload =  () => {
                    let users = Object.values(JSON.parse(xhrUsername.responseText));
                    let userCounter = 0

                    for(let user of users) {
                        if ( user.username === document.querySelector('.form__username').value ) {
                            userCounter++
                        }
                    }

                    if(userCounter !== 0) {
                        document.querySelector('.error-username').style.display ='inline';
                        document.querySelector('.error-username').innerHTML = 'Такой пользователь уже существует';
                    }
                    else {
                        self.sendUserData(userName,userPassword,userGender);
                    }
                }
            }
        }
        
        function checkPassword(userPassword) {
            if(userPassword.length === 0) {
                document.querySelector('.error-password').style.display ='inline';
                document.querySelector('.error-password').innerHTML = 'Пароль не может быть пустым';
                return false;
            }
            return true;
        }

        function checkGender(userGender) {
            if(userGender === null) {
                document.querySelector('.error-gender').style.display ='inline';
                document.querySelector('.error-gender').innerHTML = 'Выберете пол';
                return false
            };

            return true;
        }



    }

    sendUserData (userName,userPassword,userGender) {

        let user = {
            username: userName,
            password: userPassword,
            gender: userGender
        }

        let xhrUserData = new XMLHttpRequest();
        xhrUserData.open('POST','https://chat-91ad3.firebaseio.com/userdata.json', true);
        xhrUserData.send(JSON.stringify(user));

        xhrUserData.onload = () => {
            let userPath = {
                username: userName,
                path: JSON.parse(xhrUserData.responseText).name
            }


            let xhrSendUser = new XMLHttpRequest();
            xhrSendUser.open('POST', 'https://chat-91ad3.firebaseio.com/users.json', true);
            xhrSendUser.send(JSON.stringify(userPath));
            xhrSendUser.onload = () => {
                document.querySelector('.successful-registration').style.display ='flex';
                document.querySelector('.successful-registration__button').focus();
                document.querySelector('.form').style.display ='none';
                document.querySelector('.footer').style.display ='none';

                document.querySelector('.successful-registration__button').addEventListener('click', (event) => {
                    event.preventDefault();
                    new Login();
                })
            };
        }
    }
}

class  Login {
        constructor() {
            this.path = null;
            this.render();
        }
        render() {
            document.body.innerHTML = `<div class="login">
                                           <header class="header">
                                               <div class="header__logo">chat app</div>
                                               <h1 class="header__welcome">Welcome to Chat app</h1>
                                           </header>
                                             <span class="error-username">Длина имени  должна быть не менее 4 символов</span>
                                             <span class="error-password">Пароль не должен быть пустым</span>
                                           <form class="form" action="">
                                               <input class="form__username" type="text" placeholder="Username" autofocus>
                                               <input class="form__password" type="password" placeholder="Password">
                                               <button class="form__sigh-in">Sign In</button>
                                           </form>
                                            <footer class="footer">Don't have account? <span class="footer__sigh-up">Sigh Up</span></footer>
                                
                                        </div>`;
            document.querySelector('.form__username').focus();
            document.querySelector('.error-username').style.display ='none';
            document.querySelector('.error-password').style.display ='none';
            let sighIn = document.querySelector('.form__sigh-in');
            sighIn.addEventListener('click', this.checkout.bind(this));

            let sighUp = document.querySelector('.footer__sigh-up');
            sighUp.addEventListener( 'click', () => {new CreateAccount()});
        }

        checkout(event){
            let self = this;
            document.querySelector('.error-username').style.display ='none';
            document.querySelector('.error-password').style.display ='none';
            event.preventDefault();

            let userName = document.querySelector('.form__username').value;
            let userPassword = document.querySelector('.form__password').value;
            checkUserName(userName);

            function checkUserName(userName) {
                if(userName.length < 3) {
                    document.querySelector('.error-username').style.display ='inline';
                    document.querySelector('.error-username').innerHTML='Имя не должно быть меньше 3-х символов';
                    return false;
                }

                else if(checkPassword(userPassword)) {
                    let xhrUsername = new XMLHttpRequest();
                    xhrUsername.open('GET','https://chat-91ad3.firebaseio.com/users.json', true);
                    xhrUsername.send();
                    xhrUsername.onload =  () => {
                        let users = Object.values(JSON.parse(xhrUsername.responseText));
                        let userCounter = 0
                        let userName = document.querySelector('.form__username').value;

                        for(let user of users) {
                            if ( user.username === userName ) {
                                userCounter++;
                                self.path = user.path;

                                if(checkPassword(userPassword)){

                                    let xhrPassword = new XMLHttpRequest();
                                    xhrPassword.open( 'GET',`https://chat-91ad3.firebaseio.com/userdata/${user.path}.json`, true );
                                    xhrPassword.send();
                                    xhrPassword.onload =  () => {
                                        let password = JSON.parse(xhrPassword.responseText).password;
                                        let gender =  JSON.parse(xhrPassword.responseText).gender;
                                        if ( password === document.querySelector('.form__password').value ) {


                                            new Contacts(userName,self.path,gender);
                                        }
                                        else {
                                            document.querySelector('.error-password').style.display ='inline';
                                            document.querySelector('.error-password').innerHTML = 'Пароль не верный';
                                        }
                                    }
                                }
                            }
                        }
                        if(userCounter === 0) {
                            document.querySelector('.error-username').style.display ='inline';
                            document.querySelector('.error-username').innerHTML = 'Нет такого пользователя';
                        };
                    }
                }
                return true;
            }

            function checkPassword(userPassword) {
                if(userPassword.length === 0) {
                    document.querySelector('.error-password').style.display ='inline';
                    document.querySelector('.error-password').innerHTML = 'Пароль не может быть пустым';
                    return false;
                }
                return true;
            }





        }

}


new Login();

