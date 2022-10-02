/*
1. Render songs
2. Scroll top 
3. Play / pause / seek 
4. CD rotate
5. Next / prev
6. Random
7. Next / Repeat when ended
8. Active song
9. Scroll active song into view
10. play song when click
*/
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd');
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')

const app = {


    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    //Lưu những lựa chọn vào các nút vào storage 
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
        name: "There's Nothing Holdin_ Me Back ",
        singer: "Shawn Mendes",
        path: "./assets/music/There_s Nothing Holdin_ Me Back - Shawn.mp3",
        image: "./assets/img/ShawnMendes.jpg"
        },
        {
        name: "Demons",
        singer: "Images Dragon",
        path: "./assets/music/Demons - Imagine Dragon.mp3",
        image:"./assets/img/demons.jpg   "     
        },
        {
        name: "Break My Heart",
        singer: "Dua Lipa",
        path:
        "./assets/music/Break My Heart - Dua Lipa.mp3",
        image: "./assets/img/dualipa.jpg"
        },
        {
        name: "Bao tiền một mớ bình yên?",
        singer: "14 Casper & Bon",
        path: "./assets/music/'bao tiền một mớ bình yên-' - 14 Casper & Bon (Official).mp3",
        image:
            "./assets/img/baotienmobinhyen.jpg"
        },
        {
        name: "Little Do You Know",
        singer: "Alex & Sierra",
        path: "./assets/music/Little Do You Know - Alex_ Sierra.mp3",
        image:
        "./assets/img/littledoyouknow.jpg"
        },
        {
        name: "Friend Like Me",
        singer: "Rachel Grae",
        path:
            "./assets/music/rachel-grae-friend-like-me-official-fan-video-(mp3convert.org).mp3",
        image:
            "./assets/img/friendlikeme.jpg"
        },
        {
        name: "Khuôn Mặt Đáng Thương",
        singer: "Sơn Tùng - MTP",
        path: "./assets/music/Khuôn mặt đáng thương - Sơn Tùng MTP.mp3",
        image:
            "./assets/img/sontung.jpg"
        }
    ],

    setConfig : function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map( (song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? "active" : ""}" data-index = "${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },


    //lấy ra bài hát ở vị trí index 
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        //gắn this để sử dụng trong hàm con 
        _this = this;

        //Xử lý CD rotate / dừng
        const cdThumbanimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //quay 360 độ trong 10s 
            iterations: Infinity
        })
        //ban đầu để cd pause -> thay đổi khi click play 
        cdThumbanimate.pause()

        //scrollTop xử lý phóng to/ thu nhỏ cd 
        const cdWidth = cd.offsetWidth;

        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ?newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // xử lý khi click play 
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        //khi song được play
        audio.onplay = function() {
            player.classList.add("playing");
            _this.isPlaying = true;

            //trở lại trạng thái đầu tiên rồi rotate CD
            cdThumbanimate.cancel();
            cdThumbanimate.play();
        } 
        
        //khi song được pause
        audio.onpause = function() {
            player.classList.remove("playing");
            _this.isPlaying = false;

            //pause rotate CD
            cdThumbanimate.pause();
        }
        
        // khi tiến độ bài hát thay đổi (khi play) 
        audio.ontimeupdate = function() {
            if( audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) *100)  
                progress.value = progressPercent;
            }
        }


        //bắt sự kiện khi tua
        progress.onchange = function() {
            const seek = (progress.value * audio.duration)/100
            audio.currentTime = seek;
        }

        //khi next song
        const nextFunSong = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        } 
        nextBtn.onclick = nextFunSong

        //khi prev song
        prevBtn.onclick = function() {

            //check xem có đang bật random ko
            if(_this.isRandom) {
                _this.playRandomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();

        } 

        //Xử lý bật / tắt random
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom)
        }

        //Xử lý phát lại 1 bài hát
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat)
        }


        // xử lý khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            }else{
                if(_this.isRandom) {
                    nextFunSong();
                }else{
                    if(_this.currentIndex == _this.songs.length-1){
                    audio.pause(); 
                    } else(
                    nextFunSong()
                    )
                }
            }
        }

        //lắng nghe hành vi vào playList sau khi render 
        playList.onclick = function(e){
            const songNode = e.target.closest(".song:not(.active)"); 
            //closest  tìm kiếm cây DOM để tìm các phần tử phù hợp. trả về giá trị tìm thấy, ko thấy return NULL
            if( songNode && !e.target.closest(".option")){
                //xử lý khi click vào song
                _this.currentIndex = Number(songNode.getAttribute("data-index")); // songNode.dataset.index -> Return về dạng chuỗi
                _this.loadCurrentSong()
                _this.render();
                audio.play();
            }
            
            //xử lý khi click vào option
            if(e.target.closest(".option")) {
                console.log("click  option");
            }
        }
        
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: 'center'
            });
        },300)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++;

        if(this.currentIndex >= this.songs.length) {
             this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;

        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },


    playRandomSong: function() {
        let newIndex 
        do {
            newIndex = Math.floor(Math.random()*this.songs.length)
        } while (newIndex == this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
   
   
    start: function() {
        // gắn cấu hình từ config vào ứng dụng
        this.loadConfig();

        //đĩnh nghĩa các thuộc tính cho Object
        this.defineProperties()

        //render lại playlist
        this.render();

        //tải thông tin bài hát đầu tiên UI khi chạy ứng dụng
        this.loadCurrentSong();

        //lắng nghe / xử lí các sự kiện (Dom events)
        this.handleEvents();

        //hiển thị trạng thái ban đầu của button Random & Repeat(TH F5)
        randomBtn.classList.toggle("active", this.isRandom)
        repeatBtn.classList.toggle("active", this.isRepeat)
    }
}

app.start();