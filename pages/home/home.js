// pages/home/home.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 窗口可用的高度
    wh: 0,
    // 摄像头的朝向front back
    position: 'front',
    // 照片的路径
    src: '',
    // 是否展示选择的照片
    isShowPic: false,
    isShowBox: false,
    // 人脸信息
    faceInfo: null,
    // 映射关系
    map: {
      gender: {
        male: '男',
        female: '女'
      },
      expression: {
        none: '不笑',
        smile: '微笑',
        laugh: '大笑'
      },
      glasses: {
        none:'无眼镜',
        common: '普通眼镜',
        sun: '墨镜'
      },
      emotion: {
        angry:'愤怒',
        disgust: '厌恶',
        fear: '恐惧',
        happy:'高兴',
        sad:'伤心',
        surprise:'惊讶',
        neutral:'无表情',
        pouty: '撅嘴',
        grimace:'鬼脸'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()
    console.log(sysInfo)
    this.setData({
      wh: sysInfo.windowHeight
    })
  },
  // 切换摄像头
  reverseCamera() {
    const newPosition = this.data.position === 'front' ? 'back' : 'front'
    this.setData({
      position: newPosition
    })
  },

  // 相册
  takePhoto() {
    // 创建相机的实例对象
    const ctx = wx.createCameraContext()
    // ctx. takePhoto 实现拍照
    ctx.takePhoto({
      quality: 'high',
      success:  (res) => {
        console.log(res.tempImagePath)
        this.setData({
          src: res.tempImagePath,
          isShowPic: true
        }, () => {
          this.getFaceInfo()
        })
      },
      fail: () => {
        console.log('拍照失败！')
        this.setData({
          src: ''
        })
      }
    })
  },

  // 从相册选取照片
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['original'],
      success: (res) => {
        console.log(res)
        if (res.tempFilePath.length > 0) {
          this.setData({
            src: res.tempFilePath[0],
            isShowPic: true
          }, () => {
            this.getFaceInfo()
          })
        }
      },
      fail: () => {
        console.log('选择拍照失败！')
        this.setData({
          src: ''
        })
      }
    })
  },

  // 重新选择照片
  reChoose() {
    this.setData({
      isShowPic: false,
      src: '',
      isShowBox: false
    })
  },

  // 测颜值的函数
  getFaceInfo() {
    console.log('调用了测颜值的函数')
    console.log(app.globalData)
    const token = app.globalData.access_token
    if (!token) {
      return wx.showToast({
        title: '鉴权失败',
      })
    }

    wx.showLoading({
      title: '颜值检测中...',
    })

    // 进行颜值的检测
    // 如何把用户选择的照片，转码为base64格式的字符串呢? ? ?
    const fileManager = wx.getFileSystemManager()
    const fileStr = fileManager.readFileSync(this.data.src, 'base64')
    console.log(fileStr)

    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + token,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        image_type: 'BASE64',
        image: fileStr,
        face_field: 'age,beauty,expression,gender,glasses,emotion'
      },
      success: (res) => {
        console.log(res)
        if (res.data.result.face_num <= 0) {
          return wx.showToast({
            title: '未检测到人脸',
          })
        }
        this.setData({
          faceInfo: res.data.result.face_list[0],
          isShowBox: true
        })
      },
      fail: () => {
        wx.showToast({
          title: '颜值检测失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})