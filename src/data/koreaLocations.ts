export interface District {
  name: string;
  lat: number;
  lon: number;
}

export interface RegionGroup {
  city: string;
  subLabel: string;
  districts: District[];
}

export const KOREA_REGIONS: RegionGroup[] = [
  {
    city: '서울',
    subLabel: '구 선택',
    districts: [
      { name: '강남구', lat: 37.5172, lon: 127.0473 },
      { name: '강동구', lat: 37.5301, lon: 127.1238 },
      { name: '강북구', lat: 37.6396, lon: 127.0257 },
      { name: '강서구', lat: 37.5509, lon: 126.8495 },
      { name: '관악구', lat: 37.4784, lon: 126.9516 },
      { name: '광진구', lat: 37.5385, lon: 127.0823 },
      { name: '구로구', lat: 37.4954, lon: 126.8874 },
      { name: '금천구', lat: 37.4519, lon: 126.9020 },
      { name: '노원구', lat: 37.6542, lon: 127.0568 },
      { name: '도봉구', lat: 37.6688, lon: 127.0471 },
      { name: '동대문구', lat: 37.5744, lon: 127.0396 },
      { name: '동작구', lat: 37.5124, lon: 126.9393 },
      { name: '마포구', lat: 37.5663, lon: 126.9016 },
      { name: '서대문구', lat: 37.5791, lon: 126.9368 },
      { name: '서초구', lat: 37.4837, lon: 127.0324 },
      { name: '성동구', lat: 37.5633, lon: 127.0369 },
      { name: '성북구', lat: 37.5894, lon: 127.0167 },
      { name: '송파구', lat: 37.5145, lon: 127.1066 },
      { name: '양천구', lat: 37.5169, lon: 126.8664 },
      { name: '영등포구', lat: 37.5264, lon: 126.8963 },
      { name: '용산구', lat: 37.5326, lon: 126.9905 },
      { name: '은평구', lat: 37.6027, lon: 126.9291 },
      { name: '종로구', lat: 37.5730, lon: 126.9794 },
      { name: '중구', lat: 37.5641, lon: 126.9979 },
      { name: '중랑구', lat: 37.6066, lon: 127.0926 },
    ],
  },
  {
    city: '수원',
    subLabel: '구 선택',
    districts: [
      { name: '장안구', lat: 37.3040, lon: 127.0102 },
      { name: '권선구', lat: 37.2576, lon: 126.9718 },
      { name: '팔달구', lat: 37.2821, lon: 127.0200 },
      { name: '영통구', lat: 37.2596, lon: 127.0465 },
    ],
  },
  {
    city: '인천',
    subLabel: '군·구 선택',
    districts: [
      { name: '중구', lat: 37.4738, lon: 126.6217 },
      { name: '동구', lat: 37.4739, lon: 126.6432 },
      { name: '미추홀구', lat: 37.4636, lon: 126.6503 },
      { name: '연수구', lat: 37.4102, lon: 126.6782 },
      { name: '남동구', lat: 37.4474, lon: 126.7315 },
      { name: '부평구', lat: 37.5074, lon: 126.7219 },
      { name: '계양구', lat: 37.5374, lon: 126.7377 },
      { name: '서구', lat: 37.5455, lon: 126.6760 },
      { name: '강화군', lat: 37.7465, lon: 126.4881 },
      { name: '옹진군', lat: 37.4465, lon: 126.6367 },
    ],
  },
  {
    city: '대전',
    subLabel: '구 선택',
    districts: [
      { name: '동구', lat: 36.3120, lon: 127.4549 },
      { name: '중구', lat: 36.3258, lon: 127.4214 },
      { name: '서구', lat: 36.3554, lon: 127.3838 },
      { name: '유성구', lat: 36.3623, lon: 127.3561 },
      { name: '대덕구', lat: 36.3467, lon: 127.4157 },
    ],
  },
  {
    city: '대구',
    subLabel: '구·군 선택',
    districts: [
      { name: '중구', lat: 35.8694, lon: 128.6062 },
      { name: '동구', lat: 35.8866, lon: 128.6355 },
      { name: '서구', lat: 35.8719, lon: 128.5592 },
      { name: '남구', lat: 35.8460, lon: 128.5977 },
      { name: '북구', lat: 35.8858, lon: 128.5830 },
      { name: '수성구', lat: 35.8581, lon: 128.6306 },
      { name: '달서구', lat: 35.8299, lon: 128.5326 },
      { name: '달성군', lat: 35.7747, lon: 128.4313 },
      { name: '군위군', lat: 36.2428, lon: 128.5728 },
    ],
  },
  {
    city: '광주',
    subLabel: '구 선택',
    districts: [
      { name: '동구', lat: 35.1461, lon: 126.9231 },
      { name: '서구', lat: 35.1520, lon: 126.8895 },
      { name: '남구', lat: 35.1328, lon: 126.9025 },
      { name: '북구', lat: 35.1741, lon: 126.9120 },
      { name: '광산구', lat: 35.1396, lon: 126.7937 },
    ],
  },
  {
    city: '부산',
    subLabel: '구·군 선택',
    districts: [
      { name: '중구', lat: 35.1062, lon: 129.0323 },
      { name: '서구', lat: 35.0979, lon: 129.0242 },
      { name: '동구', lat: 35.1293, lon: 129.0455 },
      { name: '영도구', lat: 35.0912, lon: 129.0680 },
      { name: '부산진구', lat: 35.1631, lon: 129.0532 },
      { name: '동래구', lat: 35.2048, lon: 129.0780 },
      { name: '남구', lat: 35.1366, lon: 129.0844 },
      { name: '북구', lat: 35.1972, lon: 128.9903 },
      { name: '해운대구', lat: 35.1631, lon: 129.1636 },
      { name: '사하구', lat: 35.1045, lon: 128.9748 },
      { name: '금정구', lat: 35.2431, lon: 129.0921 },
      { name: '강서구', lat: 35.2122, lon: 128.9806 },
      { name: '연제구', lat: 35.1763, lon: 129.0798 },
      { name: '수영구', lat: 35.1456, lon: 129.1132 },
      { name: '사상구', lat: 35.1526, lon: 128.9912 },
      { name: '기장군', lat: 35.2446, lon: 129.2223 },
    ],
  },
  {
    city: '제주',
    subLabel: '지역 선택',
    districts: [
      { name: '제주시', lat: 33.4996, lon: 126.5312 },
      { name: '서귀포시', lat: 33.2541, lon: 126.5601 },
    ],
  },
];

export function findNearestRegionLabel(lat: number, lon: number): string {
  let closestLabel = '현재 위치';
  let minDistance = Infinity;

  for (const region of KOREA_REGIONS) {
    for (const district of region.districts) {
      const dLat = district.lat - lat;
      const dLon = district.lon - lon;
      const distSq = dLat * dLat + dLon * dLon;
      if (distSq < minDistance) {
        minDistance = distSq;
        closestLabel = `${region.city} ${district.name} 부근`;
      }
    }
  }

  // Only label with the nearest city/district if reasonably within South Korea (~50km radius)
  if (minDistance > 0.3) {
    return '현재 위치';
  }
  return closestLabel;
}
