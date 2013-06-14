<?php
	header('Content-Type: text/html; charset=utf-8');
	header('Cache-Control: no-cache, no-store, must-revalidate');
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>FlipFlap</title>

	<link rel="stylesheet" href="./css/common.css?<?php echo filemtime('./css/common.css')?>">
	<script src="./js/jx.js"></script>
	<script src="./js/flipflap.js?<?php echo filemtime('./js/flipflap.js')?>"></script>
	<script src="./soundmanager2/script/soundmanager2.js"></script>
</head>
<body>
	<select id="select_music" size="6">
		<optgroup label="Love &amp; Joy - 木村 由姫">
			<option value="lovenjoy-easy" selected>EASY [LV. 3]</option>
			<option value="lovenjoy-medium">MEDIUM [LV. 7]</option>
		</optgroup>
	</select>
	<input type="button" value="PLAY" onclick="playGame(this)">
	<div id="time">0</div>
	<div id="wrap">
		<div id="game">
			<ul>
				<li>
					<div class="line line_01">
						<div class="animate"></div>
						<div class="column">A</div>
					</div>
				</li>
				<li>
					<div class="line line_02">
						<div class="animate"></div>
						<div class="column">S</div>
					</div>
				</li>
				<li>
					<div class="line line_03">
						<div class="animate"></div>
						<div class="column">D</div>
					</div>
				</li>
				<li>
					<div class="line line_04">
						<div class="animate"></div>
						<div class="column">F</div>
					</div>
				</li>
				<li>
					<div class="line line_05">
						<div class="animate"></div>
						<div class="column">&forall;</div>
					</div>
				</li>
				<li>
					<div class="line line_06">
						<div class="animate"></div>
						<div class="column">H</div>
					</div>
				</li>
				<li>
					<div class="line line_07">
						<div class="animate"></div>
						<div class="column">J</div>
					</div>
				</li>
				<li>
					<div class="line line_08">
						<div class="animate"></div>
						<div class="column">K</div>
					</div>
				</li>
				<li>
					<div class="line line_09">
						<div class="animate"></div>
						<div class="column">L</div>
					</div>
				</li>
			</ul>
		</div>
		<div id="panel">
			<div id="musicbar">
				<ul></ul>
			</div>
			<div id="information">
				<div class="albumart">
					<img src="" alt="">
				</div>
				<div class="info">
					<h2 class="name"></h2>
					<h3 class="artist"></h3>
					<h4 class="time"></h4>
				</div>
				<div class="scoreinfo">
					<div id="ar">00.00%</div>
					<div id="totalscore">0</div>
					<div class="sub">
						PERFECT <span id="perfect">000</span><br>
						GREAT <span id="great">000</span><br>
						GOOD <span id="good">000</span><br>
						MISS <span id="miss">000</span>
					</div>
				</div>
			</div>
		</div>
		<div class="clearfix"></div>
	</div>
<script>
	var ff = FlipFlap.getGameObject(document);
	FlipFlap.setObject(document.getElementById('wrap'));

	soundManager.setup({
		url: './soundmanager2/swf/',
		preferFlash: false,
		debugMode: false,
		useHighPerformance: false
	});

	function playGame(btn) {
		if(window.chrome == undefined) {
			alert('Google Chrome ONLY!');
			return;
		}

		var value = document.getElementById('select_music').value;
		if(!value) {
			alert('Please select music.');
			return;
		}

		var minfo = value.split('-');

		btn.setAttribute('disabled', 'disabled');
		ff.load(minfo[0], minfo[1]);
	}
</script>
</body>
</html>