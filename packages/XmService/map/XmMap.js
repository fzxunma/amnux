export class XmMap {
  static async getQQAddress(address) {
    const response = await fetch(
      "http://apis.map.qq.com/ws/geocoder/v1/?address=" +
        encodeURIComponent(address) +
        "&key=W3NBZ-7XBKJ-LJGFY-FH6GG-EGDTH-3FB2G"
    );
    let data = {};
    if (response.status === 200) {
      data = await response.json();
      console.log(data);
    }
    return data;
  }
}