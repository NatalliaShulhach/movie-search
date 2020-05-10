let carousel = document.querySelector('.carousel');
let container = document.querySelector('.container');
let carouselDisplaying;
let screenSize;
let lengthOfSlide;
let renderСounter = 1;
let counterDrawSlides = 1;
let isRequestError = false;
let userRequest = null;
let width = null;

let isCrossIcon = false;

let carouselContent = document.querySelector('.carousel-content');
let slides = document.querySelectorAll('.slide');
let position = 0;



document.querySelector('.nav-left').onclick = function () {
    if (counterDrawSlides <= 1) {
        return;
    }
    counterDrawSlides -= 1;
    position += width;
    carouselContent.style.marginLeft = position + 'px';
};

document.querySelector('.nav-right').onclick = function () {
    counterDrawSlides += 1;
    if (counterDrawSlides >= renderСounter * 10 - carouselDisplaying) {
        renderСounter += 1;
        searchMovie(userRequest);
    }
    position -= width;
    carouselContent.style.marginLeft = position + 'px';
};

window.addEventListener('resize', setScreenSize);

function setScreenSize() {
    if (window.innerWidth >= 1600) {
        carouselDisplaying = 4;
    } else if (window.innerWidth < 1600 && window.innerWidth > 1024) {
        carouselDisplaying = 3;
    } else if (window.innerWidth < 1024 && window.innerWidth > 700) {
        carouselDisplaying = 2;
    } else { 
        carouselDisplaying = 1;
    }
    getScreenSize();
}


function getScreenSize() {
    let slides = document.querySelectorAll('.slide');
    let slidesArray = Array.prototype.slice.call(slides);
    lengthOfSlide = Math.floor(carousel.offsetWidth / carouselDisplaying);
    width = lengthOfSlide;
    let initialWidth = 0;
    slidesArray.forEach(function (el) {
        el.style.width = lengthOfSlide + "px";
        el.style.left = initialWidth + "px";
        initialWidth += lengthOfSlide;
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////

async function searchMovie(userRequest, isClearSearch) {
    if (!userRequest) {
        userRequest = "star";
    }
    if (isClearSearch) {
        renderСounter = 1;
    }
    let url = `https://www.omdbapi.com/?s=${userRequest}&page=${renderСounter}&apikey=699bb316`;
    let responseMovie = await fetch(url);
    let resultMovie = await responseMovie.json();

    if (resultMovie.Response == "True" && userRequest.length) {
        let length = resultMovie.Search.length;
        drawCarousel(resultMovie, isClearSearch, length);
        return;
    }

    if (resultMovie.Response == "False") {
        document.getElementsByClassName("search_error_message")[0].innerText = `${resultMovie.Error}`;
    }
}

function drawCarousel(resultMovieSearch, isClearSearch, length = 10) {
    if (isClearSearch) {
        position = 0;
        carouselContent.style.marginLeft = position + 'px';
        counterDrawSlides = 1;
        carouselContent.innerText = null;
    }
    for (let i = 0; i < length; i++) {
        let sl = document.createElement("div");
        sl.classList.add("slide");
        carouselContent.append(sl);

        let titleCard = document.createElement("span");
        titleCard.classList.add("title_card");
        titleCard.innerText = resultMovieSearch.Search[i].Title;
        sl.append(titleCard);

        let iconStar = document.createElement("img");
        iconStar.classList.add("icon_star");
        iconStar.src = "img/icon/star.jpg";
        sl.append(iconStar);

        let ratingMovieId = resultMovieSearch.Search[i].imdbID;
        let ratingData = document.createElement("span");
        ratingData.classList.add("rating_data");
        sl.append(ratingData);
        setRatingMovie(ratingData, ratingMovieId);

        let poster = document.createElement("img");
        poster.classList.add("poster");
        poster.src = resultMovieSearch.Search[i].Poster;
        sl.append(poster);

        let releaseYear = document.createElement("span");
        releaseYear.classList.add("release_year");
        releaseYear.innerText = resultMovieSearch.Search[i].Year;
        sl.append(releaseYear);
    }
    setScreenSize();
}

async function setRatingMovie(el, ratingMovie) {
    let movieRatingUrl = `https://www.omdbapi.com/?i=${ratingMovie}&plot=full&apikey=699bb316`;
    let responseRatingMovie = await fetch(movieRatingUrl);
    let resultRatingMovie = await responseRatingMovie.json();
    if (resultRatingMovie.Response == "True") {
        const rating = resultRatingMovie.Ratings[0];
        if (rating) {
            el.innerText = rating.Value.slice(0, -3);
        }
    }
    return;
}

async function getEngWord() {
    userRequest = document.getElementsByTagName("input")[0].value.trim();
    document.getElementsByClassName("search_error_message")[0].innerText = `Results for "${userRequest}"`;
    let wordUrl = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200322T155651Z.de98a60e6a99185e.089aea4237b51c6db082c966f27a7895cd1e8b44&text=${userRequest}&lang=ru-en`;
    let responseWordUrl = await fetch(wordUrl);
    let resultResponseWordUrl = await responseWordUrl.json();
    if (resultResponseWordUrl.code == 502) {
        document.getElementsByClassName("search_error_message")[0].innerText = "Enter movie title";
        searchMovie(userRequest, true);
        return;
    }

    if (resultResponseWordUrl.code == 200) {
        carouselContent.innerText = "";
        document.getElementsByClassName("search_error_message")[0].innerText = `Results for "${userRequest}"`;
        userRequest = resultResponseWordUrl.text;
        searchMovie(userRequest, true);
        return;
    }
};

document.onkeyup = function (keyEl) {
    userRequest = null;
    keyEl = keyEl || window.event;
    if (keyEl.key === "Enter") {
        userRequest = document.getElementsByTagName("input")[0].value.trim();
        if (!userRequest.length) {
            document.getElementsByClassName("search_error_message")[0].innerText = "Enter movie title";
            searchMovie(userRequest);
            return;
        }
        document.getElementsByClassName("search_error_message")[0].innerText = `Results for "${userRequest}"`;
        carouselContent.innerText = "";
        getEngWord();
    }
    return false;
}

document.getElementsByTagName("label")[0].onclick = () => {
    userRequest = document.getElementsByTagName("input")[0].value.trim();
    if (!userRequest.length) {
        document.getElementsByClassName("search_error_message")[0].innerText = "Enter movie title";
        return;
    }
    document.getElementsByClassName("search_error_message")[0].innerText = `Results for "${userRequest}"`;
    searchMovie(userRequest, true);
};

function getLoader() {
    let resultFieldMessage = document.getElementsByClassName("search_error_message")[0];
    let loaderWrapper = document.createElement("div");
    loaderWrapper.classList.add("lds-ripple");
    resultFieldMessage.append(loaderWrapper);

    let loader1 = document.createElement("div");
    loaderWrapper.append(loader1);

    let loader2 = document.createElement("div");
    loaderWrapper.append(loader2);
}
document.onload = searchMovie();

// /////////////////////////////////////////////////////////////////////////////////

let isKeybordOpen = false;

let keyboardIcon = document.getElementsByClassName("icon_keyboard")[0];
keyboardIcon.onclick = function () {
        if(isKeybordOpen == false){
        let keys = [
            ["ё", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
            ["Tab", "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ", "\\", "Del"],
            ["CapsLock", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "Enter"],
            ["Shift", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".", "▲", "Shift"],
            ["Ctrl", "Win", "Alt", " ", "Alt", "◄", "▼", "►", "Ctrl"]
        ];

        let keysEn = [
            ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
            ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "Del"],
            ["CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
            ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "▲", "Shift"],
            ["Ctrl", "Win", "Alt", " ", "Alt", "◄", "▼", "►", "Ctrl"]
        ];

        let codes = [
            ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
            ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash", "Delete"],
            ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
            ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ArrowUp", "ShiftRight"],
            ["ControlLeft", "OSLeft", "AltLeft", "Space", "AltRight", "ArrowLeft", "ArrowDown", "ArrowRight", "ControlRight"]
        ];


        let IsEnglish = false;

        (function PaintKeyboard() {
            let wrapper = document.createElement('div');
            wrapper.classList.add("wrapper");
            document.body.append(wrapper);

            let keyboard = document.createElement('div');
            keyboard.classList.add("keyboard");
            wrapper.append(keyboard);

            for (let i = 0; i < 5; i++) {

                let row = document.createElement('div');
                row.classList.add("row");
                keyboard.append(row);

                for (let j = 0; j < keys[i].length; j++) {

                    let key = document.createElement('div');
                    key.classList.add("key");
                    key.classList.add(codes[i][j]);
                    row.append(key);


                    let span = document.createElement('span');
                    span.classList.add("ru");
                    key.append(span);
                    span.innerHTML = keys[i][j];


                    span = document.createElement('span');
                    span.classList.add("en");
                    key.append(span);
                    span.innerHTML = keysEn[i][j];
                }
            }
            let describe = document.createElement('p');
            keyboard.append(describe);
            describe.innerHTML = 'Change language (ctrl + shift)';
        }());

        let el = null;
        let input = document.getElementsByClassName("input")[0];
        let isShiftPressed = false;
        let isControlPressed = false;

        function KeyboardEventHandling(event) {
            let code = event.code;
            if (event.type === "keyup") {
                document.onkeyup = KeepStateCtrlShift;
            }
            for (let i = 0; i < codes.length; i++) {
                for (let j = 0; j < codes[i].length; j++) {
                    if (code == codes[i][j]) {
                        el = document.getElementsByClassName(`key ${code}`)[0];
                        el.classList.add('pressed');
                    }
                }
            }
        }

        function MouseEventHandling(event) {
            if (event.type == "mousedown") {
                el = event.target;
                if (el.tagName == 'SPAN') {
                    el = el.parentElement;
                }

                el.classList.add('pressed');
                document.onmouseup = KeepStateCtrlShift;


                if (el.classList.contains('Backspace')) {
                    PressedBackspace();
                    return;
                }

                if (el.classList.contains('Delete')) {
                    PressedDelete();
                    return;
                }

                if (el.classList.contains('Enter')) {
                    PressedEnter();
                    document.getElementsByClassName("keyboard")[0].remove();
                    return;
                }

                if (el.classList.contains('Space')) {
                    PressedSpace();
                    return;
                }

                if (el.classList.contains('Tab')) {
                    PressedTab();
                    return;
                }

            }

            if (!(el.innerText == 'Backspace' ||
                el.innerText == "Ctrl" ||
                el.innerText == "Shift" ||
                el.innerText == "Tab" ||
                el.innerText == "CapsLock" ||
                el.innerText == "Alt" ||
                el.innerText == "Del" ||
                el.innerText == "Win" ||
                el.innerText == "Enter")) {
                input.value += `${el.innerText}`;
            }
        }

        function KeepStateCtrlShift() {
            if (el.innerText == "Shift") {
                if (isShiftPressed) {
                    el.classList.remove('pressed');
                    isShiftPressed = false;
                } else {
                    isShiftPressed = true;
                }
                if (isShiftPressed && isControlPressed) {
                    LanguageSwitch();
                }
                return;
            }

            if (el.innerText == "Ctrl") {
                if (isControlPressed) {
                    el.classList.remove('pressed');
                    isControlPressed = false;
                } else {
                    isControlPressed = true;
                }
                if (isShiftPressed && isControlPressed) {
                    LanguageSwitch();
                }
                return;
            }
            el.classList.remove('pressed');
        }

        document.querySelector(".input").onkeyup = KeyboardEventHandling;
        document.querySelector(".input").onkeydown = KeyboardEventHandling;

        let button = document.querySelectorAll('.key');

        for (let i = 0; i < button.length; i++) {
            button[i].onmousedown = MouseEventHandling;
        }


        document.querySelectorAll(".en").forEach(x => x.classList.add("invisible"));

        function LanguageSwitch() {

            if (IsEnglish) {
                localStorage.setItem('SetEnglish', false);
                document.querySelectorAll(".en").forEach(x => x.classList.add("invisible"));
                document.querySelectorAll(".ru").forEach(x => x.classList.remove("invisible"));
                IsEnglish = false;
            } else {
                localStorage.setItem('SetEnglish', true);
                document.querySelectorAll(".en").forEach(x => x.classList.remove("invisible"));
                document.querySelectorAll(".ru").forEach(x => x.classList.add("invisible"));
                IsEnglish = true;
            }
        }

        function PressedBackspace() {
            if (el.classList.contains('Backspace')) {
                input.setRangeText('', input.selectionStart - 1, input.selectionEnd);
                input.focus();
            }
        }

        function PressedDelete() {
            if (el.classList.contains('Delete')) {
                input.setRangeText('', input.selectionStart, input.selectionEnd + 1);
                input.focus();
            }
        }

        function PressedEnter() {
            isKeybordOpen = false;
            getEngWord();
        }

        function PressedSpace() {
            if (el.classList.contains('Space')) {
                input.setRangeText(' ', input.selectionStart, input.selectionEnd, 'end')
            }
        }

        function PressedTab() {
            if (el.classList.contains('Tab')) {
                input.value += '   ';
            }
        }

        if (localStorage.getItem("SetEnglish") === "true") {
            LanguageSwitch();
        }
        isKeybordOpen = true;
        return
    }
    
    if(isKeybordOpen == true){
        isKeybordOpen = false;
        document.getElementsByClassName("keyboard")[0].remove();
    }
}
