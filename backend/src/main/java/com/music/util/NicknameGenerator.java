package com.music.util;

import java.util.Random;

@Component
public class NicknameGenerator {

    private static final String[] PREFIXES = {"音乐", "旋律", "音符", "节奏", "梦幻", "星空", "阳光", "彩虹", "微风", "海浪", "青山", "绿水", "飞翔", "奔跑", "快乐", "幸福", "甜蜜", "温馨", "浪漫", "优雅"};
    private static final String[] SUFFIXES = {"使者", "精灵", "天使", "达人", "爱好者", "迷", "控", "家", "师", "神", "王", "帝", "后", "侠", "客", "友", "人", "生", "者", "魂"};
    private static final String[] ADJECTIVES = {"可爱", "酷炫", "帅气", "美丽", "温柔", "善良", "勇敢", "智慧", "幽默", "风趣", "开朗", "活泼", "安静", "神秘", "优雅", "高贵", "时尚", "潮流", "古典", "现代"};
    private static final Random random = new Random();

    // 生成随机昵称
    public static String generateNickname() {
        int type = random.nextInt(3);
        switch (type) {
            case 0:
                return PREFIXES[random.nextInt(PREFIXES.length)] + SUFFIXES[random.nextInt(SUFFIXES.length)];
            case 1:
                return ADJECTIVES[random.nextInt(ADJECTIVES.length)] + PREFIXES[random.nextInt(PREFIXES.length)];
            case 2:
                return ADJECTIVES[random.nextInt(ADJECTIVES.length)] + SUFFIXES[random.nextInt(SUFFIXES.length)];
            default:
                return PREFIXES[random.nextInt(PREFIXES.length)] + SUFFIXES[random.nextInt(SUFFIXES.length)];
        }
    }

    // 生成多个随机昵称
    public static String[] generateNicknames(int count) {
        String[] nicknames = new String[count];
        for (int i = 0; i < count; i++) {
            nicknames[i] = generateNickname();
        }
        return nicknames;
    }
}