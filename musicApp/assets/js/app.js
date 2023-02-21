/**
 * 1.  Render songs -
 * 2.  Scroll top
 * 3.  play / pause / seek
 * 4.  CD rotate
 * 5.  Next / prev
 * 6.  random
 * 7.  Next / Repeat when ended
 * 8.  Active song
 * 9.  Scoll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

// Lấy ra player
const player = $(".player");

// Lấy ra element của CD
const cd = $(".cd");

// Lấy ra heading, tcThumb, audio
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");

// Lấy ra nút play / pause
const playBtn = $(".btn-toggle-play");

// Lấy ra thanh input progress
const progress = $("#progress");

// Lấy ra nút next - prev - random - repeat
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

// Thời gian song
const playerDuration = $(".play-duration");
const playerRemaining = $(".play-remaining");

// Lấy ra playlist
const playlist = $(".playlist");

// const playlist = ${'.playlist'}  // Đặt biến playlist,
// vì không lặp lại nên có thể viết ở trong const app

const app = {
  // lấy ra chỉ mục đầu tiên của mảng
  currentIndex: 0,

  // mặc định của playing & random = false.
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

  songs: [
    {
      name: "Anh Chẳng Sao Mà",
      singer: "Khang Việt",
      path: "./assets/music/Anh Chang Sao Ma - Khang Viet.mp3",
      image: "./assets/img/KhangViet.jpg",
    },
    {
      name: "Có Hẹn Với Thanh Xuân",
      singer: "Hoàng Dũng; Grey D; Orange; Tlinh",
      path: "./assets/music/Co Hen Voi Thanh Xuan - Suni Ha Linh_ Ho.mp3",
      image: "./assets/img/HD.jpg",
    },
    {
      name: "Ít Nhưng Dài Lâu",
      singer: "Chu Thúy Quỳnh",
      path: "./assets/music/It Nhung Dai Lau - Chu Thuy Quynh.mp3",
      image: "./assets/img/ThuyQuynh.jpg",
    },
    {
      name: "Mãi Mãi",
      singer: "Lam Trường",
      path: "./assets/music/Mai Mai - Lam Truong.mp3",
      image: "./assets/img/LamTruong.jpg",
    },
    {
      name: "My Love",
      singer: "Westlife",
      path: "./assets/music/My Love - Westlife.mp3",
      image: "./assets/img/WestLife.jpg",
    },
    {
      name: "Người Có Thương",
      singer: "ĐạtKaa",
      path: "./assets/music/Nguoi Co Thuong - DatKaa.mp3",
      image: "./assets/img/Datkaa.jpg",
    },
    {
      name: "Pháo Hồng",
      singer: "Đạt Long Vinh",
      path: "./assets/music/Phao Hong H2O Remix_ - Dat Long Vinh.mp3",
      image: "./assets/img/DLV.jpg",
    },
    {
      name: "Shape Of You",
      singer: "Ed Sheeran",
      path: "./assets/music/Shape Of You - ed sheeran.mp3",
      image: "./assets/img/ED.jpg",
    },
    {
      name: "Why Not Me",
      singer: "Enrique Iglesias",
      path: "./assets/music/Why Not Me - Enrique Iglesias.mp3",
      image: "./assets/img/Enrique.jpg",
    },
    {
      name: "Xem Như Em Chẳng May",
      singer: "Chu Thúy Quỳnh",
      path: "./assets/music/Xem Nhu Em Chang May - Chu Thuy Quynh_ T.mp3",
      image: "./assets/img/ThuyQuynh.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  //  1 Render songs
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                        <div class="song ${
                          index === this.currentIndex ? "active" : ""
                        }" data-index="${index}">
                            <div class="thumb"
                                style="background-image: url('${song.image}');">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
    });
    playlist.innerHTML = htmls.join(""); // biến playlist viết thẳng.
  },

  // Tất cả thuốc tính đc định nghĩa cho obj thì sẽ cho vào đây:
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        // define ra property currentSong,
        // nên k cần dùng tới getCurrentSong nữa.
        return this.songs[this.currentIndex];
      },
    });
  },

  // xử lý sự kiện
  handleEvents: function () {
    // lưu this(this ở đây là app) ở bên ngoài, handle = _this
    const _this = this;

    // 2. Scroll top
    // Lấy ra cd width của nó
    const cdWidth = cd.offsetWidth;

    // 4. Xử lý CD quay - dừng
    // animate sẽ nhận đối số là 1 mảng, trong mảng
    // này ta truyền được những cofig của animation vào.
    const cdThumbAnimate = cdThumb.animate(
      [
        { transform: "rotate(360deg)" }, //quay 360 độ
      ],
      {
        duration: 15000, // trong 10 giây
        iterations: Infinity,
      }
    );
    // giá trị mặc định khi quay sẽ là pause, để khi ấn play thì sẽ chay, ấn pause sẽ dừng ở vị trí quay đến.
    cdThumbAnimate.pause();

    // Lắng nghe sự kiện kéo (document.scroll),
    // Để phóng to / thu nhỏ CD
    document.onscroll = function () {
      // lấy ra trục dọc (window.scroolY) -
      // window - biến đại diện cho cửa sổ trình duyệt
      // ScrollY - trục dọc trong trục tọa độ.

      // (window.scrollY) có thể k họat động trên 1 số trình duyệt
      // console.log(window.scrollY)
      // cách khác nữa để lấy ra thẻ html, nếu cái nào lấy đc thì dùng.
      // console.log(document.documentElement.scrollTop)

      // toán tử logic, scroll window, nếu k có window thì lấy ông đằng sau.
      const scrollTop = window.scroolY || document.documentElement.scrollTop;

      // tính ra đc newWidth sẽ bằng cdWidth trừ đi scrollTop
      const newCdWidth = cdWidth - scrollTop;
      // kiểm tra xem cdWidth đã trừ scrollTop chưa
      // console.log(newCdWidth)

      // khi kéo nhanh quá thì sẽ về giá trị âm,
      // nên nó k hợp lệ => sẽ k chạy nữa => k xét đc width về 0.
      // cd.style.width = newCdWidth + 'px'

      // cách khắc phục:
      // check newCdWidth > 0 thì lấy newCdWidth + 'px'
      // còn ngược lại thì lấy giá trị = 0.
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;

      // opacity mờ dần = newCdWidth / cdWidth // để lấy tỉ lệ
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    playBtn.onclick = function () {
      // Nếu
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      //  Khi song đc play thì audio play
      audio.onplay = function () {
        _this.isPlaying = true;
        player.classList.add("playing");
        cdThumbAnimate.play();
      };

      //  Khi song bị pause thì audio sẽ dừng lại
      audio.onpause = function () {
        _this.isPlaying = false;
        player.classList.remove("playing");
        cdThumbAnimate.pause();
      };

      // this trong này sẽ là this của function,
      // - chính là playBtn

      // Tư duy, nếu ấn vào play thì sẽ chạy, còn ấn vào pause thì sẽ dừng.
      // if (_this.isPlaying) {
      //     // Nếu đang playing thì sẽ pause
      //     _this.isPlaying = false;

      //     // audio sẽ tạm dừng
      //     audio.pause();

      //     // Khi pause xóa classList playing
      //     player.classList.remove('playing');
      // }
      // else { // ngược lại của if
      //     // nếu đang pause thì sẽ play
      //     _this.isPlaying = true;

      //     // audip sẽ play
      //     audio.play();

      //     // Khi player lấy ra classlist
      //     player.classList.add('playing');
      // };
    };

    // duration - trả về tổng thời lượng bài hát hiện tại.
    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      // kiểm tra xem nó đã trả về, phần trăm chạy đc chưa
      // console.log(audio.currentTime / audio.duration * 100)
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );

        // trừ ngược thời gian thực của bài hát.
        const timeRemain = audio.duration - audio.currentTime;
        let RemainMinutes;
        if (Math.floor(timeRemain % 60) < 10) {
          RemainMinutes =
            (timeRemain - (timeRemain % 60)) / 60 +
            ":0" +
            Math.floor(timeRemain % 60);

          playerRemaining.textContent = RemainMinutes;
        } else {
          RemainMinutes =
            (timeRemain - (timeRemain % 60)) / 60 +
            ":" +
            Math.floor(timeRemain % 60);
          playerRemaining.textContent = RemainMinutes;
        }

        // Thời gian chạy bài hát
        const currentMinute = Math.floor(audio.currentTime / 60);
        const currentSecond = Math.floor(audio.currentTime % 60);
        playerDuration.textContent = `${currentMinute}:${
          currentSecond > 9 ? currentSecond : "0" + currentSecond
        } `;
        progress.value = progressPercent;

        // thanh chạy nhạc, thêm style background từ 0-100%, và từ 100
        progress.style.background =
          "linear-gradient(to right, #d5335d 0%, var(--primary-color) " +
          progressPercent +
          "%, #d3d3d3 " +
          progressPercent +
          "%, #d3d3d3 100%)";
      }
    };

    // Tổng thời gian bài hát
    // audio.onloadeddata = function () {
    //   _this.songTime = audio.duration.toFixed();

    //   const second = _this.songTime % 60;
    //   playerRemaining.textContent = `0${Math.floor(_this.songTime / 60)}:${
    //     second > 9 ? second : "0" + second
    //   }`;
    // };

    // Xử lý khi tua song
    progress.oninput = function (e) {
      // e = event

      // progress.oninput = function (e) {
      //    onchange sẽ bị lỗi tua chậm k được nên ta sử dụng oninput
      // khi onchange cần phải lấy ra được cái e.target.value(%của nó)
      // audio.duration - tổng số giây, e.target.value - % giây của bài hát
      // console.log(audio.duration * e.target.value / 100)

      // lấy ra số giây của % chạy được,
      // tổng số giây chia 100 nhân % giây chạy được.
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random songs
    randomBtn.onclick = function (e) {
      // thay đổi trạng thái của nút random
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // xử lý lặp lại 1 song
    repeatBtn.onclick = function (e) {
      // thay đổi trạng thái của nút repeat
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.onclick(); // auto next khi hết bài nhạc.
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      // khi click vào bất cứ thành phần nào trong playlist,
      // thì sẽ trả về đúng đối tượng mà ta click
      // console.log(e.target)
      const songNode = e.target.closest(".song:not(.active)");

      // closest trả về element, 1 là chính nó, 2 là thẻ cha của nó,
      // nếu k có sẽ trả về null
      if (songNode || e.target.closest(".option")) {
        // console.log(e.target)
        // click vào thẻ có chứa active sẽ k ăn.

        // Xử lý khi click vào song
        if (songNode) {
          // console.log(songNode.dataset.index) // lấy ra data-index song

          // currenIndex là số, khi get element thì sẽ thành chuỗi,
          // nên phải convert sang Number(songNode.dataset.index)
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào option
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  },

  // Lấy ra bài hát đầu tiên,
  // nhưng làm như thế này mỗi lần lấy ra phải gán lại => dài dòng.
  // getCurrentSong: function() {
  //     return this.songs[this.currentIndex]
  // },

  // tải bài hát hiện tại
  loadCurrentSong: function () {
    // Gán cho nó heading, cdThumb, audio mới
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    // => this là trỏ đến app

    // test xem lấy đc ra heading, cdThumb, audio new hay k.
    // console.log(heading, cdThumb, audio)
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  // Next bài hát
  nextSong: function () {
    // tăng giá trị index lên để next sang (bài hát) index khác
    this.currentIndex++;

    // nếu giá trị index lớn hơn hoặc bắng độ dài của song.length,
    // thì giá trị của currentSong sẽ quay lại giá trị = 0
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  // prev song
  prevSong: function () {
    // tăng giá trị index lên để next sang (bài hát) index khác
    this.currentIndex--;

    // nếu giá trị index lớn hơn hoặc bắng độ dài của song.length,
    // thì giá trị của currentSong sẽ quay lại giá trị = 0
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  // random song
  playRandomSong: function () {
    let newIndex;

    // lấy ra 1 index ngẫu nhiên phải k đc trùng với index hiện tại.
    // Sử dụng vòng lặp do while
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
      // newIndex k bằng currentindex
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // Gán cấu hình từ Config vào ứng dụng.
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe và xử lý các sự kiện(DOM events)
    this.handleEvents();

    // Tải Thông tin bài hát đầu tiên vào UI khi chạy ứng dụng.
    this.loadCurrentSong();

    // Render playlist lại danh sách bài hát
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
