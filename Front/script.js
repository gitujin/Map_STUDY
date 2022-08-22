/*
1. 지도 생성 & 확대 축소 컨트롤러
2. 더미데이터 준비하기(제목, 주소, url, 카테고리)
3. 여러개 마커 찍기
 * 주소 - 좌표 변환(지도 라이브러리)
4. 마커에 인포윈도우 붙이기
 * 마커에 클릭 이벤트로 인포 윈도우
 * url에서 섬네일 따기
 * 클릭한 마커로 지도 센터 이동
5. 카테고리 분류
*/


/*
1. 지도 생성 & 확대 축소 컨트롤러
*/

var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(35.9479447,126.9575551), //지도의 중심좌표.
	level: 8 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);


/*
2. 더미데이터 준비하기(제목, 주소, url 카테고리)
*/

var dataSet = [
	{
		title: "더블랙",
		address: "전북 익산시 금마면 용순신기길 44-32 2층",
		url: "https://search.naver.com/search.naver?where=nexearch&sm=tab_jum&query=%EA%B8%88%EB%A7%88%EB%8D%94%EB%B8%94%EB%9E%99",
		category: "카페",
	},
	{
		title: "세엄마칼국수",
		address: "전북 익산시 평동로 509-27 세엄마칼국수",
		url: "https://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=%EC%9D%B5%EC%82%B0+%EC%84%B8%EC%97%84%EB%A7%88%EC%B9%BC%EA%B5%AD%EC%88%98&oquery=%EC%84%B8%EC%97%84%EB%A7%88%EC%B9%BC%EA%B5%AD%EC%88%98&tqi=hYE8hdprvhGssuRhxLdssssssLs-217703",
		category: "한식",
	},
	{
		title: "하루스시",
		address: "전북 익산시 고봉로 306",
		url: "https://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=%EC%9D%B5%EC%82%B0+%ED%95%98%EB%A3%A8%EC%8A%A4%EC%8B%9C&oquery=%EC%9D%B5%EC%82%B0+%ED%95%98%EB%A3%A8%EC%B4%88%EB%B0%A5&tqi=hYE8AlprvOsssOEDimKssssstk8-074987",
		category: "일식",
	},
];


/*
3. 여러개 마커 찍기
*/

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

//주소-좌표 변환 함수
function getCoordsByAddress(address){
	return new Promise((resolve, reject) => {
	// 주소로 좌표를 검색합니다
		geocoder.addressSearch(address, function(result, status) {
    	// 정상적으로 검색이 완료됐으면 
			if (status === kakao.maps.services.Status.OK) {
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
				resolve(coords);
				return;
			}
			reject(new Error("getCoordsByAddress Error: not Valid Address"));
		});    		
	});
}

setMap(dataSet);

/*
4. 마커에 인포윈도우 붙이기
*/

function getContent(data){
	//인포윈도우 가공하기
	return `
	<div class="infowindow-body">
	  <h5 class="infowindow-title">${data.title}</h5>
	  <p class="infowindow-address">${data.address}</p>
	  <a href="${data.url}" class="infowindow-btn" target="_blank">상세정보 이동</a>
	</div>
	`;
}

async function setMap(dataSet){
	for (var i = 0; i < dataSet.length; i ++) {
		// 마커를 생성합니다
			let coords = await getCoordsByAddress(dataSet[i].address);
		    var marker = new kakao.maps.Marker({
			map: map, // 마커를 표시할 지도
			position: coords, // 마커를 표시할 위치
		});

		markerArray.push(marker);

	    // 마커에 표시할 인포윈도우를 생성합니다 
		var infowindow = new kakao.maps.InfoWindow({
			content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
		});

		infowindowArray.push(infowindow);
	
		// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
		// 이벤트 리스너로는 클로저를 만들어 등록합니다 
		// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
		kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow,  coords));
		kakao.maps.event.addListener(map, 'click', makeOutListener(infowindow));
	}
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
// 1. 클릭 시 다른 인포윈도우 닫기
// 2. 클릭한 곳으로 지도 옮기기

function makeOverListener(map, marker, infowindow, coords) {
    return function() {
		// 1. 클릭 시 다른 인포윈도우 닫기
		closeInfowindow();
        infowindow.open(map, marker);
		// 2. 클릭한 곳으로 지도 중심 옮기기
		map.panTo(coords);
    };
}

let infowindowArray = [];
function closeInfowindow(){
	for(let infowindow of infowindowArray){
		infowindow.close();
	}
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
    return function() {
        infowindow.close();
    };
}

/*
5. 카테고리 분류
*/
const categoryMap = {
	korea: "한식",
	chian: "중식",
	japan: "일식",
	america: "양식",
	wheat: "분식",
	meat: "구이",
	sushi: "술집",
	cafe: "카페",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

function categoryHandler(event){
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];

	//데이터 분류
	let categorizedDataSet = [];
	for(let data of dataSet){
		if(data.category === category){
			categorizedDataSet.push(data);
		}
	}

	// 기존 마커 삭제
	closeMarker();

	// 기존 인포윈도우 닫기
	closeInfowindow();

	setMap(categorizedDataSet);
}

let markerArray = [];
function closeMarker() {
	for(marker of markerArray){
		marker.setMap(null);
	}
}