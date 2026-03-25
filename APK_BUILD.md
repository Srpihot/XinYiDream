# 心易梦 APK 打包指南

## 前置要求

1. 安装 Node.js (v16+)
2. 安装 Android Studio
3. 配置 Android SDK

## 打包步骤

### 1. 安装依赖

```bash
cd /Users/srpihot/Desktop/meihua
npm install
```

### 2. 初始化 Capacitor

```bash
npx cap init
```

### 3. 添加 Android 平台

```bash
npx cap add android
```

### 4. 同步项目

```bash
npm run sync
```

### 5. 打开 Android Studio

```bash
npm run open:android
```

### 6. 构建 APK

在 Android Studio 中：
- 选择 Build → Build Bundle(s) / APK(s) → Build APK(s)
- 或者使用命令行：

```bash
cd android
./gradlew assembleDebug
```

APK 将生成在：`android/app/build/outputs/apk/debug/app-debug.apk`

## 签名发布版本

### 1. 生成签名密钥

```bash
keytool -genkey -v -keystore xinyimeng.keystore -alias xinyimeng -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

在 `android/app/build.gradle` 中添加：

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("xinyimeng.keystore")
            storePassword "你的密码"
            keyAlias "xinyimeng"
            keyPassword "你的密码"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. 构建发布版

```bash
cd android
./gradlew assembleRelease
```

APK 将生成在：`android/app/build/outputs/apk/release/app-release.apk`

## 快速脚本

一键构建调试版：

```bash
npm install && npx cap add android && npm run sync && npm run build:apk
```
