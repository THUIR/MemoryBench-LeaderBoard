export const eloData = {
  "cases": {
    "domain/Academic&Knowledge": {
      "elo": {
        "a_mem-8B": 1062.8,
        "bm25_dialog-8B": 1015.7,
        "bm25_message-8B": 1235.3,
        "embedder_dialog-8B": 830.3,
        "embedder_message-8B": 1027.6,
        "mem0-8B": 960.8,
        "memoryos-8B": 880.3,
        "wo_memory-8B": 851.8,
        "a_mem-32B": 1078.3,
        "bm25_dialog-32B": 1134.3,
        "bm25_message-32B": 1173.9,
        "embedder_dialog-32B": 925.6,
        "embedder_message-32B": 1078.4,
        "mem0-32B": 954.5,
        "memoryos-32B": 835.7,
        "wo_memory-32B": 954.6
      },
      "n_systems": 16,
      "n_samples": 154
    },
    "domain/Legal": {
      "elo": {
        "a_mem-8B": 932.6,
        "bm25_dialog-8B": 813.2,
        "bm25_message-8B": 974.0,
        "embedder_dialog-8B": 945.8,
        "embedder_message-8B": 915.2,
        "mem0-8B": 982.1,
        "memoryos-8B": 892.5,
        "wo_memory-8B": 952.9,
        "a_mem-32B": 1139.3,
        "bm25_dialog-32B": 938.2,
        "bm25_message-32B": 1128.0,
        "embedder_dialog-32B": 1108.2,
        "embedder_message-32B": 1064.0,
        "mem0-32B": 1253.9,
        "memoryos-32B": 941.2,
        "wo_memory-32B": 1019.0
      },
      "n_systems": 16,
      "n_samples": 181
    },
    "domain/Open-Domain": {
      "elo": {
        "a_mem-8B": 1012.2,
        "bm25_dialog-8B": 1080.2,
        "bm25_message-8B": 953.5,
        "embedder_dialog-8B": 866.0,
        "embedder_message-8B": 890.6,
        "memoryos-8B": 906.8,
        "wo_memory-8B": 1091.6,
        "a_mem-32B": 892.1,
        "bm25_dialog-32B": 962.1,
        "bm25_message-32B": 999.6,
        "embedder_dialog-32B": 1173.7,
        "embedder_message-32B": 854.3,
        "memoryos-32B": 1029.9,
        "wo_memory-32B": 1287.4
      },
      "n_systems": 14,
      "n_samples": 245
    },
    "task/Long-Long": {
      "elo": {
        "a_mem-8B": 924.5,
        "bm25_dialog-8B": 976.6,
        "bm25_message-8B": 1145.7,
        "embedder_dialog-8B": 960.9,
        "embedder_message-8B": 1010.7,
        "mem0-8B": 932.6,
        "memoryos-8B": 971.3,
        "wo_memory-8B": 1008.9,
        "bm25_dialog-32B": 986.0,
        "bm25_message-32B": 1169.5,
        "embedder_dialog-32B": 961.3,
        "embedder_message-32B": 1011.0,
        "wo_memory-32B": 941.1
      },
      "n_systems": 13,
      "n_samples": 199
    },
    "task/Long-Short": {
      "elo": {
        "a_mem-8B": 1088.3,
        "bm25_dialog-8B": 1093.5,
        "bm25_message-8B": 1183.2,
        "embedder_dialog-8B": 898.3,
        "embedder_message-8B": 890.2,
        "memoryos-8B": 964.8,
        "wo_memory-8B": 956.0,
        "bm25_dialog-32B": 971.6,
        "bm25_message-32B": 1099.1,
        "embedder_dialog-32B": 929.4,
        "embedder_message-32B": 1012.6,
        "wo_memory-32B": 913.0
      },
      "n_systems": 12,
      "n_samples": 139
    },
    "task/Short-Long": {
      "elo": {
        "a_mem-8B": 713.2,
        "bm25_dialog-8B": 901.6,
        "bm25_message-8B": 936.9,
        "embedder_dialog-8B": 1160.5,
        "embedder_message-8B": 1101.0,
        "mem0-8B": 1021.0,
        "memoryos-8B": 864.2,
        "wo_memory-8B": 1046.7,
        "bm25_dialog-32B": 994.2,
        "bm25_message-32B": 924.4,
        "embedder_dialog-32B": 1089.3,
        "embedder_message-32B": 1032.1,
        "wo_memory-32B": 1214.7
      },
      "n_systems": 13,
      "n_samples": 140
    },
    "task/Short-Short": {
      "elo": {
        "a_mem-8B": 1217.3,
        "bm25_dialog-8B": 988.9,
        "bm25_message-8B": 873.5,
        "embedder_dialog-8B": 952.8,
        "embedder_message-8B": 968.4,
        "mem0-8B": 824.1,
        "memoryos-8B": 825.4,
        "wo_memory-8B": 1161.5,
        "bm25_dialog-32B": 1093.4,
        "bm25_message-32B": 882.9,
        "embedder_dialog-32B": 1153.2,
        "embedder_message-32B": 920.0,
        "wo_memory-32B": 1138.6
      },
      "n_systems": 13,
      "n_samples": 144
    }
  },
  "overall_elo": {
    "a_mem-8B": { "avg": 993.0, "participated_cases": 7 },
    "bm25_dialog-8B": { "avg": 981.4, "participated_cases": 7 },
    "bm25_message-8B": { "avg": 1043.2, "participated_cases": 7 },
    "embedder_dialog-8B": { "avg": 944.9, "participated_cases": 7 },
    "embedder_message-8B": { "avg": 972.0, "participated_cases": 7 },
    "mem0-8B": { "avg": 944.1, "participated_cases": 5 },
    "memoryos-8B": { "avg": 900.7, "participated_cases": 7 },
    "wo_memory-8B": { "avg": 1009.9, "participated_cases": 7 },
    "a_mem-32B": { "avg": 1036.5, "participated_cases": 3 },
    "bm25_dialog-32B": { "avg": 1011.4, "participated_cases": 7 },
    "bm25_message-32B": { "avg": 1053.9, "participated_cases": 7 },
    "embedder_dialog-32B": { "avg": 1048.7, "participated_cases": 7 },
    "embedder_message-32B": { "avg": 996.1, "participated_cases": 7 },
    "mem0-32B": { "avg": 1104.2, "participated_cases": 2 },
    "memoryos-32B": { "avg": 935.6, "participated_cases": 3 },
    "wo_memory-32B": { "avg": 1066.9, "participated_cases": 7 }
  },
  "overall_elo_full_participation": {
    "a_mem-8B": { "avg": 993.0, "participated_cases": 7 },
    "bm25_dialog-8B": { "avg": 981.4, "participated_cases": 7 },
    "bm25_message-8B": { "avg": 1043.2, "participated_cases": 7 },
    "embedder_dialog-8B": { "avg": 944.9, "participated_cases": 7 },
    "embedder_message-8B": { "avg": 972.0, "participated_cases": 7 },
    "memoryos-8B": { "avg": 900.7, "participated_cases": 7 },
    "wo_memory-8B": { "avg": 1009.9, "participated_cases": 7 },
    "bm25_dialog-32B": { "avg": 1011.4, "participated_cases": 7 },
    "bm25_message-32B": { "avg": 1053.9, "participated_cases": 7 },
    "embedder_dialog-32B": { "avg": 1048.7, "participated_cases": 7 },
    "embedder_message-32B": { "avg": 996.1, "participated_cases": 7 },
    "wo_memory-32B": { "avg": 1066.9, "participated_cases": 7 }
  }
};

export const memorySystems = [
  { id: "a_mem", name: "A-Mem", description: "全量记忆存储" },
  { id: "bm25_dialog", name: "BM25-Dialog", description: "BM25检索（对话级别）" },
  { id: "bm25_message", name: "BM25-Message", description: "BM25检索（消息级别）" },
  { id: "embedder_dialog", name: "Embedder-Dialog", description: "Embedding检索（对话级别）" },
  { id: "embedder_message", name: "Embedder-Message", description: "Embedding检索（消息级别）" },
  { id: "mem0", name: "Mem0", description: "Mem0记忆系统" },
  { id: "memoryos", name: "MemoryOS", description: "MemoryOS系统" },
  { id: "wo_memory", name: "No Memory", description: "无记忆系统基线" }
];

export const baseModels = [
  { id: "8B", name: "Qwen3-8B" },
  { id: "32B", name: "Qwen3-32B" }
];

export const cases = [
  { id: "domain/Academic&Knowledge", name: "Academic & Knowledge", type: "domain", samples: 154 },
  { id: "domain/Legal", name: "Legal", type: "domain", samples: 181 },
  { id: "domain/Open-Domain", name: "Open-Domain", type: "domain", samples: 245 },
  { id: "task/Long-Long", name: "Long-Long", type: "task", samples: 199 },
  { id: "task/Long-Short", name: "Long-Short", type: "task", samples: 139 },
  { id: "task/Short-Long", name: "Short-Long", type: "task", samples: 140 },
  { id: "task/Short-Short", name: "Short-Short", type: "task", samples: 144 }
];

export function getSystemKey(memorySystemId, baseModelId) {
  return `${memorySystemId}-${baseModelId}`;
}

export function getMemorySystemId(systemKey) {
  return systemKey.replace("-8B", "").replace("-32B", "");
}

export function getBaseModelId(systemKey) {
  return systemKey.includes("-32B") ? "32B" : "8B";
}