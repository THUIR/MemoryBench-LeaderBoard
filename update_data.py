import json
import os
import re

BASE_PATH = r"D:\Git\memorybench\memorybench_results_20260603_1514_all_baselines"
OUTPUT_DIR = r"D:\Git\memorybench\src\data"
ELO_FILE = os.path.join(BASE_PATH, "elo_global_all_models.json")
TOKEN_FILE = os.path.join(BASE_PATH, "token_results", "token_global_all_models.json")

# Memory systems to include (exclude a_mem_before, a_mem_try, etc.)
VALID_MEMORY_SYSTEMS = [
    "a_mem", "bm25_dialog", "bm25_message", "embedder_dialog",
    "embedder_message", "mem0", "memoryos", "wo_memory",
    "autoskill", "uno", "uno-single"  # New systems from new data
]

# Base models
BASE_MODELS = [
    "DeepSeek-V4-Flash",
    "Gemini-3.5-Flash",
    "Mistral-Small-3.2-24B-Instruct-2506",
    "Qwen3-32B",
    "Qwen3-8B"
]

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_model_folder_name(model_id):
    """Convert model ID to folder name"""
    mapping = {
        "DeepSeek-V4-Flash": "off-policy-DeepSeek-V4-Flash",
        "Gemini-3.5-Flash": "off-policy-Gemini-3.5-Flash",
        "Mistral-Small-3.2-24B-Instruct-2506": "off-policy-Mistral-Small-3.2-24B-Instruct-2506",
        "Qwen3-32B": "off-policy-Qwen3-32B",
        "Qwen3-8B": "off-policy-Qwen3-8B"
    }
    return mapping.get(model_id, f"off-policy-{model_id}")

# Models to exclude (incomplete data)
EXCLUDED_MODELS = ["Gemini-3.5-Flash"]

def process_elo_data():
    """Process elo_global_all_models.json to create eloData.js"""
    print("Processing ELO data...")
    elo_raw = load_json(ELO_FILE)

    # Structure for eloData.js
    elo_data = {
        "cases": {},
        "overall_elo": {},
        "overall_elo_full_participation": {}
    }

    # Process cases - filter out excluded models
    for case_key, case_data in elo_raw.get("cases", {}).items():
        filtered_elo = {}
        for system_key, elo_value in case_data.get("elo", {}).items():
            # Skip systems with excluded models
            if any(excluded in system_key for excluded in EXCLUDED_MODELS):
                continue
            filtered_elo[system_key] = elo_value
        elo_data["cases"][case_key] = {
            "elo": filtered_elo,
            "n_systems": len(filtered_elo),
            "n_samples": case_data.get("n_samples", 0)
        }

    # Process overall_elo - filter out excluded models
    for system_key, stats in elo_raw.get("overall_elo", {}).items():
        if any(excluded in system_key for excluded in EXCLUDED_MODELS):
            continue
        elo_data["overall_elo"][system_key] = {
            "avg": stats.get("avg", 0),
            "participated_cases": stats.get("participated_cases", 0)
        }

    # Process overall_elo_full_participation (only systems with 7 cases)
    full_participation = {}
    for system_key, stats in elo_data["overall_elo"].items():
        if stats["participated_cases"] == 7:
            full_participation[system_key] = stats
    elo_data["overall_elo_full_participation"] = full_participation

    return elo_data

def process_summary_averages():
    """Process summary.json files to create summaryAverages.json"""
    print("Processing summary averages...")

    summary_data = {}
    base_path = BASE_PATH

    # Get all model folders (excluding incomplete data)
    model_folders = [f for f in os.listdir(base_path)
                     if f.startswith("off-policy-") and os.path.isdir(os.path.join(base_path, f))
                     and f.replace("off-policy-", "") not in EXCLUDED_MODELS]

    for model_folder in model_folders:
        model_path = os.path.join(base_path, model_folder)

        # Process domain and task folders
        for case_type in ["domain", "task"]:
            case_type_path = os.path.join(model_path, case_type)
            if not os.path.exists(case_type_path):
                continue

            for case_name in os.listdir(case_type_path):
                case_path = os.path.join(case_type_path, case_name)
                if not os.path.isdir(case_path):
                    continue

                case_key = f"{case_type}/{case_name}"

                # Process each memory system
                for memory_sys in os.listdir(case_path):
                    memory_path = os.path.join(case_path, memory_sys)
                    if not os.path.isdir(memory_path):
                        continue

                    # Find the run folder (starts with start_at_)
                    try:
                        run_folders = [f for f in os.listdir(memory_path) if f.startswith("start_at_")]
                        if not run_folders:
                            continue
                        run_path = os.path.join(memory_path, run_folders[0])
                    except:
                        continue

                    summary_file = os.path.join(run_path, "summary.json")
                    if not os.path.exists(summary_file):
                        continue

                    try:
                        summary = load_json(summary_file)
                        summary_info = summary.get("summary", {})

                        # Create system key
                        model_id = model_folder.replace("off-policy-", "")
                        system_key = f"{memory_sys}-{model_id}"

                        if case_key not in summary_data:
                            summary_data[case_key] = {}

                        summary_data[case_key][system_key] = {
                            "weighted_average": summary_info.get("weighted_average", 0),
                            "z_score": summary_info.get("z_score", 0)
                        }
                    except Exception as e:
                        print(f"    Error processing {summary_file}: {e}")
                        continue

    return summary_data

def process_samples():
    """Process predict.json and summary.json to create samples data"""
    print("Processing samples...")

    # First, collect all predict and summary data
    all_samples = {}  # case_key -> list of samples

    base_path = BASE_PATH
    model_folders = [f for f in os.listdir(base_path)
                     if f.startswith("off-policy-") and os.path.isdir(os.path.join(base_path, f))
                     and f.replace("off-policy-", "") not in EXCLUDED_MODELS]

    for model_folder in model_folders:
        model_path = os.path.join(base_path, model_folder)
        model_id = model_folder.replace("off-policy-", "")

        for case_type in ["domain", "task"]:
            case_type_path = os.path.join(model_path, case_type)
            if not os.path.exists(case_type_path):
                continue

            for case_name in os.listdir(case_type_path):
                case_path = os.path.join(case_type_path, case_name)
                if not os.path.isdir(case_path):
                    continue

                case_key = f"{case_type}/{case_name}"

                # Process each memory system
                for memory_sys in os.listdir(case_path):
                    memory_path = os.path.join(case_path, memory_sys)
                    if not os.path.isdir(memory_path):
                        continue

                    # Find the run folder
                    try:
                        run_folders = [f for f in os.listdir(memory_path) if f.startswith("start_at_")]
                        if not run_folders:
                            continue
                        run_path = os.path.join(memory_path, run_folders[0])
                    except:
                        continue

                    predict_file = os.path.join(run_path, "predict.json")
                    summary_file = os.path.join(run_path, "summary.json")
                    eval_file = os.path.join(run_path, "evaluate_details.json")

                    if not os.path.exists(predict_file):
                        continue

                    try:
                        predict_data = load_json(predict_file)

                        # Load summary data if exists
                        summary_scores = []
                        if os.path.exists(summary_file):
                            summary = load_json(summary_file)
                            # Collect all detail scores in order
                            details = summary.get("details", {})
                            all_detail_scores = []
                            for dataset_name, score_list in details.items():
                                all_detail_scores.extend(score_list)
                            summary_scores = all_detail_scores

                        # Load eval data if exists
                        eval_data = {}
                        if os.path.exists(eval_file):
                            eval_raw = load_json(eval_file)
                            eval_data = {e["test_idx"]: e for e in eval_raw}

                        # Process each predict item
                        for idx, p in enumerate(predict_data):
                            test_idx = p.get("test_idx", 0)

                            # Get score from summary details by enumerate index
                            # (details array is ordered by predict array order, not by test_idx)
                            # Only use summary details - no fallback to metrics
                            score = None
                            if idx < len(summary_scores):
                                score = summary_scores[idx]

                            # Get eval details (for messages and other info, not for score)
                            eval_item = eval_data.get(test_idx, {})
                            metrics = eval_item.get("metrics", {}) if eval_item else {}

                            # Simplify messages
                            messages = p.get("messages", [])
                            simplified_messages = []
                            for msg in messages:
                                simplified_messages.append({
                                    "role": msg.get("role", ""),
                                    "content": msg.get("content", "")[:2000] if msg.get("content") else ""
                                })

                            sample = {
                                "test_idx": test_idx,
                                "model": model_id,
                                "case_type": case_type,
                                "case_name": case_name,
                                "memory_system": memory_sys,
                                "dataset": eval_item.get("dataset", p.get("dataset", "")),
                                "messages": simplified_messages,
                                "response": p.get("response", "")[:2000] if p.get("response") else "",
                                "metrics": {
                                    **metrics,  # Keep original metrics (may have rougel, etc.)
                                    **({"avg_score": score} if score is not None else {})  # Override with correct score from summary only if available
                                },
                                "eval_details": {
                                    "exp_reasoning": metrics.get("exp_reasoning", "") if metrics else "",
                                    "gen_reasoning": metrics.get("gen_reasoning", "") if metrics else "",
                                    "golden_answer": metrics.get("golden_answer", "") if metrics else "",
                                    "evidence": metrics.get("evidence", []) if metrics else []
                                }
                            }

                            if case_key not in all_samples:
                                all_samples[case_key] = []
                            all_samples[case_key].append(sample)

                    except Exception as e:
                        print(f"    Error processing {predict_file}: {e}")
                        continue

    # Limit samples: filter null scores, then select 100 per benchmark spread across score ranges
    limited_samples = {}
    TARGET_SAMPLES = 100

    for case_key, samples in all_samples.items():
        # Filter out samples with null scores
        valid_samples = [s for s in samples if s.get("metrics", {}).get("avg_score") is not None]

        if len(valid_samples) <= TARGET_SAMPLES:
            limited_samples[case_key] = valid_samples
            continue

        # Get scores for stratification
        scores = [s["metrics"]["avg_score"] for s in valid_samples]
        min_score, max_score = min(scores), max(scores)

        # Divide into 4 ranges and sample proportionally from each
        ranges = [
            (min_score, min_score + (max_score - min_score) * 0.25),
            (min_score + (max_score - min_score) * 0.25, min_score + (max_score - min_score) * 0.5),
            (min_score + (max_score - min_score) * 0.5, min_score + (max_score - min_score) * 0.75),
            (min_score + (max_score - min_score) * 0.75, max_score)
        ]

        range_samples = [[] for _ in ranges]
        for s in valid_samples:
            score = s["metrics"]["avg_score"]
            for i, (low, high) in enumerate(ranges):
                if low <= score < high or (i == len(ranges) - 1 and score == high):
                    range_samples[i].append(s)
                    break

        # Select proportionally from each range
        result = []
        for i, range_samps in enumerate(range_samples):
            # Proportional allocation
            proportion = len(range_samps) / len(valid_samples)
            count = max(1, int(proportion * TARGET_SAMPLES))
            count = min(count, len(range_samps))

            # Sort by score within range for consistent sampling
            range_samps.sort(key=lambda x: x["metrics"]["avg_score"])
            # Pick evenly spaced samples from the range
            if count > 0:
                step = max(1, len(range_samps) // count)
                for j in range(0, len(range_samps), step):
                    if len(result) >= TARGET_SAMPLES:
                        break
                    result.append(range_samps[j])

        # Ensure we have exactly TARGET_SAMPLES or fewer
        limited_samples[case_key] = result[:TARGET_SAMPLES]

    return limited_samples

def process_token_data():
    """Process token data - both overall and per-case"""
    print("Processing token data...")

    token_dir = os.path.join(BASE_PATH, "token_results")

    result = {
        "overall": {},
        "cases": {}
    }

    # Load overall token data
    try:
        overall_file = os.path.join(token_dir, "token_global_all_models.json")
        overall_data = load_json(overall_file)

        # Filter out excluded models from systems
        if "systems" in overall_data:
            filtered_systems = {}
            for key, val in overall_data["systems"].items():
                if not any(excluded in key for excluded in EXCLUDED_MODELS):
                    filtered_systems[key] = val
            result["overall"]["systems"] = filtered_systems

        # Also copy summary info (filtered)
        if "summary" in overall_data:
            result["overall"]["summary"] = overall_data["summary"]
        if "model_summaries" in overall_data:
            filtered_model_summaries = {}
            for key, val in overall_data["model_summaries"].items():
                if key not in EXCLUDED_MODELS:
                    filtered_model_summaries[key] = val
            result["overall"]["model_summaries"] = filtered_model_summaries
        if "memory_system_summaries" in overall_data:
            result["overall"]["memory_system_summaries"] = overall_data["memory_system_summaries"]
    except Exception as e:
        print(f"  Warning: Could not load overall token data: {e}")

    # Load per-case token data
    case_files = [
        ("domain/Academic&Knowledge", "domain_Academic&Knowledge_tokens.json"),
        ("domain/Legal", "domain_Legal_tokens.json"),
        ("domain/Open-Domain", "domain_Open-Domain_tokens.json"),
        ("task/Long-Long", "task_Long-Long_tokens.json"),
        ("task/Long-Short", "task_Long-Short_tokens.json"),
        ("task/Short-Long", "task_Short-Long_tokens.json"),
        ("task/Short-Short", "task_Short-Short_tokens.json"),
    ]

    for case_key, filename in case_files:
        try:
            case_file = os.path.join(token_dir, filename)
            case_data = load_json(case_file)

            # Filter systems
            filtered_systems = {}
            if "systems" in case_data:
                for key, val in case_data["systems"].items():
                    if not any(excluded in key for excluded in EXCLUDED_MODELS):
                        filtered_systems[key] = val

            result["cases"][case_key] = {
                "systems": filtered_systems
            }
        except Exception as e:
            print(f"  Warning: Could not load token data for {case_key}: {e}")

    return result

def main():
    print("=" * 60)
    print("MemoryBench Data Update Script")
    print("=" * 60)

    # 1. Process ELO data
    elo_data = process_elo_data()
    elo_output = os.path.join(OUTPUT_DIR, "eloData.js")
    elo_content = "export const eloData = " + json.dumps(elo_data, indent=2) + ";\n\n"

    # Add memory systems and base models
    memory_systems = [
        {"id": "a_mem", "name": "A-Mem", "description": "全量记忆存储"},
        {"id": "bm25_dialog", "name": "BM25-Dialog", "description": "BM25检索（对话级别）"},
        {"id": "bm25_message", "name": "BM25-Message", "description": "BM25检索（消息级别）"},
        {"id": "embedder_dialog", "name": "Embedder-Dialog", "description": "Embedding检索（对话级别）"},
        {"id": "embedder_message", "name": "Embedder-Message", "description": "Embedding检索（消息级别）"},
        {"id": "mem0", "name": "Mem0", "description": "Mem0记忆系统"},
        {"id": "memoryos", "name": "MemoryOS", "description": "MemoryOS系统"},
        {"id": "wo_memory", "name": "No Memory", "description": "无记忆系统基线"},
        {"id": "autoskill", "name": "AutoSkill", "description": "AutoSkill记忆系统"},
        {"id": "uno", "name": "Uno", "description": "Uno记忆系统"},
        {"id": "uno-single", "name": "Uno-Single", "description": "Uno-Single记忆系统"}
    ]
    base_models = [
        {"id": "DeepSeek-V4-Flash", "name": "DeepSeek-V4-Flash"},
        {"id": "Mistral-Small-3.2-24B-Instruct-2506", "name": "Mistral-Small-3.2-24B-Instruct-2506"},
        {"id": "Qwen3-32B", "name": "Qwen3-32B"},
        {"id": "Qwen3-8B", "name": "Qwen3-8B"}
    ]

    elo_content += "export const memorySystems = " + json.dumps(memory_systems, indent=2) + ";\n\n"
    elo_content += "export const baseModels = " + json.dumps(base_models, indent=2) + ";\n\n"

    # Add cases
    cases = [
        {"id": "domain/Academic&Knowledge", "name": "Academic & Knowledge", "type": "domain", "samples": 9272},
        {"id": "domain/Legal", "name": "Legal", "type": "domain", "samples": 9158},
        {"id": "domain/Open-Domain", "name": "Open-Domain", "type": "domain", "samples": 11356},
        {"id": "task/Long-Long", "name": "Long-Long", "type": "task", "samples": 11000},
        {"id": "task/Long-Short", "name": "Long-Short", "type": "task", "samples": 8534},
        {"id": "task/Short-Long", "name": "Short-Long", "type": "task", "samples": 5720},
        {"id": "task/Short-Short", "name": "Short-Short", "type": "task", "samples": 6000}
    ]
    elo_content += "export const cases = " + json.dumps(cases, indent=2) + ";\n\n"

    # Helper functions
    elo_content += """export function getSystemKey(memorySystemId, baseModelId) {
  return `${memorySystemId}-${baseModelId}`;
}

export function getMemorySystemId(systemKey) {
  // Handle various model name suffixes
  let result = systemKey;
  const modelSuffixes = ['-DeepSeek-V4-Flash', '-Gemini-3.5-Flash', '-Mistral-Small-3.2-24B-Instruct-2506', '-Qwen3-32B', '-Qwen3-8B'];
  for (const suffix of modelSuffixes) {
    result = result.replace(new RegExp(suffix + '$'), '');
  }
  return result;
}

export function getBaseModelId(systemKey) {
  if (systemKey.includes('-DeepSeek-V4-Flash')) return 'DeepSeek-V4-Flash';
  if (systemKey.includes('-Gemini-3.5-Flash')) return 'Gemini-3.5-Flash';
  if (systemKey.includes('-Mistral-Small-3.2-24B-Instruct-2506')) return 'Mistral-Small-3.2-24B-Instruct-2506';
  if (systemKey.includes('-Qwen3-32B')) return 'Qwen3-32B';
  return 'Qwen3-8B';
}
"""

    with open(elo_output, 'w', encoding='utf-8') as f:
        f.write(elo_content)
    print(f"  Saved: {elo_output}")

    # 2. Process summary averages
    summary_data = process_summary_averages()
    summary_output = os.path.join(OUTPUT_DIR, "summaryAverages.json")
    save_json(summary_output, summary_data)
    print(f"  Saved: {summary_output}")

    # 3. Process samples
    print("  Processing samples (this may take a while)...")
    samples_data = process_samples()

    samples_dir = os.path.join(OUTPUT_DIR, "samples")
    os.makedirs(samples_dir, exist_ok=True)

    for case_key, samples in samples_data.items():
        safe_name = case_key.replace("/", "_").replace("&", "_")
        output_path = os.path.join(samples_dir, f"{safe_name}.json")
        save_json(output_path, samples)
        print(f"  {case_key}: {len(samples)} samples -> {safe_name}.json")

    # Update index.js
    index_content = "// Auto-generated index\nexport const caseList = " + json.dumps(sorted(samples_data.keys()), indent=2) + ";\n"
    index_path = os.path.join(samples_dir, "index.js")
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    print(f"  Saved: {index_path}")

    # 4. Process token data (save separately for leaderboard integration)
    token_data = process_token_data()
    if token_data:
        token_output = os.path.join(OUTPUT_DIR, "tokenData.js")
        token_content = "export const tokenData = " + json.dumps(token_data, indent=2) + ";\n"
        with open(token_output, 'w', encoding='utf-8') as f:
            f.write(token_content)
        print(f"  Saved: {token_output}")

    print("\n" + "=" * 60)
    print("Data update complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()