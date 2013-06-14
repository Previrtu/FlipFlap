/*  	WEB MUSIC RHYTHM GAME PROJECT
 * 	    _________          ________          
 *	   / ____/ (_)___     / ____/ /___ _____ 
 *	  / /_  / / / __ \   / /_  / / __ `/ __ \
 *	 / __/ / / / /_/ /  / __/ / / /_/ / /_/ /
 *	/_/   /_/_/ .___/  /_/   /_/\__,_/ .___/ 
 *	         /_/                    /_/      
 *
 *  (c) Previrtu, 2013.
 */

(function() {
	// ECMAScript 5 Strict Mode
	"use strict";

	// 구글크롬만 지원
	if(window.chrome == undefined) {
		console.error('This applicsation only supported for Google Chrome.');
		return;
	}

	// Simple AJAX Library - JX
	if(window.jx == undefined) {
		console.error('JX Libary not found.');
		return;
	}

	// 자리수 기준 반올림
	// http://mwultong.blogspot.com/2007/04/round-to-float-javascript.html
	var round = function(n, digits) {
		if (digits >= 0) return parseFloat(n.toFixed(digits));

		digits = Math.pow(10, digits);
		var t = Math.round(n * digits) / digits;

		return parseFloat(t.toFixed(0));
	}

	// 범위 내 랜덤 구해오는 함수
	var rand = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	// keyPress - keyDown/Up 키코드 테이블
	var keyCode = {
		65:  97,
		83: 115,
		68: 100,
		70: 102,
		32:  32,
		72: 104,
		74: 106,
		75: 107,
		76: 108
	};

	// 노트 변환
	var toNote = function(n) {
		var result = [0, 0, 0, 0, 0, 0, 0, 0, 0];

		var s = n.split('');
		for(var i = 0; i < s.length; i++)
			result[parseInt(s[i] - 1)] = 1;

		return result;
	};

	// Javascript Static Object - FlipFlap
	var FlipFlap = {
		Instance: null,
		soundManager: null,
		note: null,
		mbSize: 0,
		mbElement: null,
		mbTimer: null,
		timer: [],
		musicBar: [],
		pressBar: [],
		noteCount: {},

		Result: {
			SCORE: 0,
			PERFECT: 0,
			GREAT: 0,
			GOOD: 0,
			MISS: 0
		},

		Keys: {
			97 :   1, // A
			115:   2, // S
			100:   3, // D
			102:   4, // F
			32 :   5, // SPACE
			104:   6, // H
			106:   7, // J
			107:   8, // K
			108:   9, // L
		},

		AscKeys: {
			1  :  97, // A
			2  : 115, // S
			3  : 100, // D
			4  : 102, // F
			5  :  32, // SPACE
			6  : 104, // H
			7  : 106, // J
			8  : 107, // K
			9  : 108, // L
		},

		KeyState: {
			1  : false, // A
			2  : false, // S
			3  : false, // D
			4  : false, // F
			5  : false, // SPACE
			6  : false, // H
			7  : false, // J
			8  : false, // K
			9  : false, // L
		},

		Objects: {
			Root: null,
			DebugLine: null,
			Line: {},
			LineDiv: {},
			Animate: {},
			Note: {},
			Score: {},
			ClapSound: []
		},

		getGameObject: function(document) {
			if(this.Instance == null)
				this.Instance = this._GameObject;
			else return this.Instance;

			// Key Bindings
			document.onkeypress = this.Instance.keyEvent.press;
			document.onkeydown = this.Instance.keyEvent.down;
			document.onkeyup = this.Instance.keyEvent.up;

			this.Instance.calcJudgeSize();

			return this.Instance;
		},

		_GameObject: {
			last: -1,

			judge: {
				SIZE: 45,
				PERFECT: 30,
				GREAT: 50,
				GOOD: 85
			},

			height: 600,

			playClap: function() {
				for(var i = 0; i < 16; i++) {
					if(FlipFlap.Objects.ClapSound[i].playState == 1) continue;

					FlipFlap.Objects.ClapSound[i].play({
						volume: 100
					});
					break;
				}
			},

			calcScore: function() {
				FlipFlap.Result.SCORE =
					(FlipFlap.Result.PERFECT * 3) +
					(FlipFlap.Result.GREAT * 2) +
					(FlipFlap.Result.GOOD * 1) +
					(FlipFlap.Result.MISS * 0);

				FlipFlap.Objects.Score.TOTAL_SCORE.innerText = FlipFlap.Result.SCORE;
				FlipFlap.Objects.Score.PERFECT.innerText = FlipFlap.Result.PERFECT;
				FlipFlap.Objects.Score.GREAT.innerText = FlipFlap.Result.GREAT;
				FlipFlap.Objects.Score.GOOD.innerText = FlipFlap.Result.GOOD;
				FlipFlap.Objects.Score.MISS.innerText = FlipFlap.Result.MISS;
			},

			calcJudgeSize: function() {
				var c = 0;
				for(var i in this.judge) {
					c += this.judge[i];
				}

				this.judge.TOTAL_SIZE = c;

				// GC
				c = null;
			},

			keyEvent: {
				press: function(e) {
					// e.preventDefault();
					var key = e.keyCode;
				},

				down: function(e) {
					// return;
					if(FlipFlap.soundManager == null) return;
					if(FlipFlap.soundManager.playState == 1) e.preventDefault();
					var key = e.keyCode;

					if(keyCode.hasOwnProperty(e.keyCode))
						key = keyCode[e.keyCode];
					else key = -1;

					if(!FlipFlap.Keys.hasOwnProperty(key)) return;
					if(FlipFlap.KeyState[key] == true) return;
					FlipFlap.KeyState[key] = true;

					if(!FlipFlap.Objects.LineDiv[FlipFlap.Keys[key]].classList.contains('press'))
						FlipFlap.Objects.LineDiv[FlipFlap.Keys[key]].classList.add('press');

					if(FlipFlap.Objects.DebugLine != null)
						FlipFlap.Objects.DebugLine.value += [FlipFlap.Keys[key], '\n'].join('')

					// 해당 라인에 있는 가장 끝 note 엘리먼트를 찾는다.
					var last = FlipFlap.Objects.LineDiv[FlipFlap.Keys[key]].getElementsByClassName('note')[0];
					if(!last) return;

					var mTime = Math.floor((FlipFlap.soundManager.position / 1000) / FlipFlap.mbSize);

					var top = parseInt(last.offsetTop) - 15;
					if(top < FlipFlap.Instance.height - FlipFlap.Instance.judge.TOTAL_SIZE) return;
					if(top > FlipFlap.Instance.height - FlipFlap.Instance.judge.PERFECT - FlipFlap.Instance.judge.SIZE) {
						FlipFlap.Result.PERFECT++;
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].className = 'animate';
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].classList.add('perfect');
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].innerText = '100%';
						FlipFlap.pressBar[mTime] += 3;
					} else if(top > FlipFlap.Instance.height - FlipFlap.Instance.judge.GREAT - FlipFlap.Instance.judge.SIZE) {
						FlipFlap.Result.GREAT++;
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].className = 'animate';
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].classList.add('great');
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].innerText = 'GREAT';
						FlipFlap.pressBar[mTime] += 1;
					} else if(top > FlipFlap.Instance.height - FlipFlap.Instance.judge.GOOD - FlipFlap.Instance.judge.SIZE){
						FlipFlap.Result.GOOD++;
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].className = 'animate';
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].classList.add('good');
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].innerText = 'good';
						FlipFlap.pressBar[mTime] += 1;
					} else if(top > 0) {
						FlipFlap.Result.MISS++;
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].className = 'animate';
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].classList.add('miss');
						FlipFlap.Objects.Animate[FlipFlap.Keys[key]].innerText = 'miss';
					}

					last.classList.remove('action');
					last.parentNode.removeChild(last);
					FlipFlap.Instance.calcScore();

					// FlipFlap.Instance.playClap();

					// GC
					key = null;
					mTime = null;
					top = null;
				},
				up: function(e) {
					// e.preventDefault();
					var key = e.keyCode;

					if(keyCode.hasOwnProperty(e.keyCode))
						key = keyCode[e.keyCode];
					else key = -1;

					if(!FlipFlap.Keys.hasOwnProperty(key)) return;
					FlipFlap.KeyState[key] = false;

					if(FlipFlap.Objects.LineDiv[FlipFlap.Keys[key]].classList.contains('press'))
						FlipFlap.Objects.LineDiv[FlipFlap.Keys[key]].classList.remove('press');

					// GC
					key = null;
				}
			},

			load: function(name, difficulty) {
				// load note
				jx.load(['./note/', name, '/', difficulty, '.csv'].join(''), function(data) {
					// load information
					document.querySelector('#information div.albumart img').src = ['./note/', name, '/jacket.jpg'].join('');
					var split = data.split('\n');
					document.querySelector('#information div.info > .name').innerText = split[0];
					document.querySelector('#information div.info > .artist').innerText = split[1];

					// load sound
					soundManager.setup({
						url: './soundmanager2/swf/',
						preferFlash: false,
						debugMode: false,
						useHighPerformance: true,
						onready: function() {
							FlipFlap.soundManager = soundManager.createSound({
								url: ['./note/', name, '/music.mp3'].join(''),
								autoLoad: true,
								onload: function() {
									console.info('sound loaded');
									FlipFlap.Instance.setNote(data, function() {
										FlipFlap.Instance.setMusicBar(FlipFlap.soundManager.duration / 1000);
									});

									var duration = Math.round(FlipFlap.soundManager.duration / 1000);
									var minutes = Math.floor(duration / 60);
									var seconds = duration - minutes * 60;

									document.querySelector('#information div.info .time').innerText = [minutes, ':', seconds].join('');

									// GC
									minutes = null;
									seconds = null;
								}
							});

							for(var i = 0; i < 16; i++) {
								FlipFlap.Objects.ClapSound.push(soundManager.createSound({
									url: './sound/clap.mp3',
									autoLoad: true,
									onload: function() {
										console.log('Clap sound loaded.');
									}
								}));
							}
						}
					});

					// GC
					split = null;
				}, function(errCode) {
					alert('노트가 존재하지 않습니다.');
				}, 'text');
			},

			setNote: function(data, callback) {
				var timer = {};
				data = data.split('\n');

				for(var d in data) {
					var i = data[d];

					if(i.indexOf(',') != -1) {
						i = i.split(',');
						if(isNaN(parseInt(i[0]))) continue;
						timer[i[0]] = [];

						var nte = toNote(i[1]);
						for (var j = 0; j < 9; j++)
						{
							if (nte[j] == 1)
							{
								timer[i[0]].push(j + 1);
							}
						}
					}
				}

				for(var intv in timer) {
					var t = parseFloat((intv / 1000).toFixed(2));
					if(!FlipFlap.noteCount[t]) FlipFlap.noteCount[t] = 0;

					FlipFlap.noteCount[t] = timer[intv].length;
				}

				FlipFlap.note = timer;
				callback();

				// GC
				timer = null;
				data = null;
			},

			setMusicBar: function(duration) {
				var size = parseFloat((duration / 120).toFixed(2));
				var arr = []; arr[200] = null;
				var time_dic = {};
				for(var i = 0; i < 120; i++) {
					time_dic[i] = parseFloat(size * (i + 1).toFixed(2));
				}

				var i = 0;
				for(var noteTime in FlipFlap.noteCount) {
					for(var dicNum in time_dic) {
						if(!arr[dicNum]) arr[dicNum] = 0;

						var start = 0;
						if(time_dic[dicNum] > 0) start = parseFloat(time_dic[dicNum]) - size;

						var ntime = parseFloat(noteTime);
						if(start < ntime && ntime < parseFloat(time_dic[dicNum])) {
							arr[dicNum] += FlipFlap.noteCount[noteTime];
							FlipFlap.pressBar[dicNum] = 0;
						}
						
						// Max MusicBar Limit: 16
						// if(arr[dicNum] > 16) arr[dicNum] = 16;
					}
				}

				FlipFlap.musicBar = arr;
				FlipFlap.mbSize = size;

				this.drawMusicBar();

				// GC
				arr = null;
				size = null;
				i = null;
				time_dic = null;
			},

			drawMusicBar: function() {
				if(!FlipFlap.musicBar || FlipFlap.musicBar.length < 120) return;
				var mb = document.getElementById('musicbar').getElementsByTagName('ul')[0];

				for(var i = 0; i < 120; i++) {
					var len = FlipFlap.musicBar[i];
					if(len > 16) len = 16;

					var row = document.createElement('li');
					row.className = ['line l_', (i + 1) + ''].join('');

					for(var j = 0; j < 16 - len; j++) {
						var div = document.createElement('div');
						div.className = 'blank';

						var ico = document.createElement('i');
						div.appendChild(ico);
						row.appendChild(div);
					}
					for(var j = 0; j < len; j++) {
						var div = document.createElement('div');
						div.className = 'fill gray';

						var ico = document.createElement('i');
						div.appendChild(ico);
						row.appendChild(div);

						// 하나만 그려보자..
						break;
					}
					for(var j = 0; j < len - 1; j++) {
						var div = document.createElement('div');
						div.className = 'blank';

						var ico = document.createElement('i');
						div.appendChild(ico);
						row.appendChild(div);
					}

					mb.appendChild(row);
				}

				FlipFlap.mbElement = mb;

				this.bindGame();

				// GC
				mb = null;
			},

			bindGame: function() {
				FlipFlap.soundManager.play({
					volume: 80
				});
				for(var intv in FlipFlap.note) {
					var sync = 900;
					var time = intv - sync;

					var t = setTimeout(this.drawNote, time, this, FlipFlap.note[intv], time, sync);
					FlipFlap.timer.push(t);
				}

				FlipFlap.mbTimer = setInterval(this.redrawMusicBar, 500, this);

				console.info('Start');
			},

			drawNote: function(root, num, t, sync) {
				if(root.last == t) return;
				else root.last = t;

				// if(FlipFlap.Objects.DebugLine != null)
				// 	FlipFlap.Objects.DebugLine.value += [t, ': ', num.join(',') ,'\n'].join('')

				for(var i = 0; i < num.length; i++) {
					var note = document.createElement('div');
					note.classList.add('note');
					note.classList.add('action');
					note.addEventListener('webkitAnimationEnd', function() {
						var pos = parseInt(this.offsetLeft);
						this.classList.remove('action');
						this.style.left = pos + 'px';
						FlipFlap.Result.MISS++;
						FlipFlap.Instance.calcScore();

						this.parentNode.removeChild(this);
					}, false);
					FlipFlap.Objects.LineDiv[num[i]].appendChild(note);
				}


				var t = setTimeout(function() {
					// root.playClap();
					clearTimeout(t);
					var t2 = FlipFlap.timer.shift();
					clearInterval(t2);

					// GC
					t = null;
					t2 = null;
				}, sync);
			},

			redrawMusicBar: function(root) {
				var pos = FlipFlap.soundManager.position - (FlipFlap.mbSize * 1000);
				var calc = Math.floor((pos / 1000) / FlipFlap.mbSize);

				if(calc <= 0) return;
				if(FlipFlap.pressBar[calc] == undefined && FlipFlap.musicBar[calc] == 0 && calc >= 118) {
					clearInterval(FlipFlap.mbTimer);
					FlipFlap.Instance.endMusic();
					return;
				}
				// console.info(calc, FlipFlap.pressBar[calc], FlipFlap.musicBar[calc]);

				var rootelem = FlipFlap.mbElement.getElementsByClassName(['l_', calc].join(''))[0];
				var elem = rootelem.getElementsByClassName('fill');
				if(elem.length > 0) {
					for(var i = 0; i < elem.length; i++) {
						elem[i].classList.remove('gray');

						if(FlipFlap.pressBar[calc] >= FlipFlap.musicBar[calc] * 3)
							elem[i].classList.add('yellow');
						else if(FlipFlap.pressBar[calc] >= FlipFlap.musicBar[calc])
							elem[i].classList.add('blue');
						else
							elem[i].classList.add('black');
					}

					FlipFlap.Instance.endMusic();
				}

				rootelem.style.backgroundColor = 'rgba(255,255,255,.1)';

				if(calc == 0 || FlipFlap.soundManager.playState == 0) {
					clearInterval(FlipFlap.mbTimer);
					FlipFlap.Instance.endMusic();
				}

				// GC
				pos = null;
				calc = null;
			},

			endMusic: function() {
				// 최종판정 계산(퍼센티지)
				/* PERFECT : 1.0
				 * GREAT   : 0.7
				 * GOOD    : 0.4
				 * MISS    : 0
				 */

				var final = FlipFlap.Result;
				var AR = (( final.PERFECT * 1 ) +
						 ( final.GREAT * 0.7 ) +
						 ( final.GOOD  * 0.5 ) +
						 ( final.MISS  * 0.0 )) / ( final.PERFECT + final.GREAT + final.GOOD + final.MISS );
				AR = round(AR * 100, 2);

				document.getElementById('ar').innerText = [AR, '%'].join('');


				final = null;
				AR = null;
			}
		},

		setObject: function(root) {
			this.Objects.Root = root;
			// this.Objects.DebugLine = document.getElementById('debug');

			var line = root.getElementsByTagName('li');
			for(var i = 0; i < line.length; i++) {
				this.Objects.Line[i + 1] = line[i];
				this.Objects.LineDiv[i + 1] = line[i].getElementsByClassName('line')[0];
				this.Objects.Animate[i + 1] = line[i].getElementsByClassName('line')[0].getElementsByClassName('animate')[0];

				this.Objects.Animate[i + 1].addEventListener('webkitAnimationEnd', function() {
					this.className = 'animate';
					this.innerText = '';
				}, false);
			}

			this.Objects.Score = {
				TOTAL_SCORE: document.getElementById('totalscore'),
				PERFECT: document.getElementById('perfect'),
				GREAT: document.getElementById('great'),
				GOOD: document.getElementById('good'),
				MISS: document.getElementById('miss'),
			};
		}
	};

	window.FF = window.FlipFlap = FlipFlap;
	window.onresize = (function() {
		if(document.width < 840 || document.height < 450) {
			console.error('Client window size error');
			window.stop();
		}
	});
})();