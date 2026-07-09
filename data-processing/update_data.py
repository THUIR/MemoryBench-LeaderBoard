import json
import os
import re

BASE_PATH = r"D:\Git\memorybench\oss_memorybench_results"
OUTPUT_DIR = r"D:\Git\memorybench\src\data"
ELO_FILE = os.path.join(BASE_PATH, "elo_global_all_models.json")
TOKEN_FILE = os.path.join(BASE_PATH, "token_results", "token_global_all_models.json")

# Memory systems to include
VALID_MEMORY_SYSTEMS = [
    "a_mem", "bm25_dialog", "bm25_message", "embedder_dialog",
    "embedder_message", "mem0", "memoryos", "wo_memory",
    "uno", "uno-single", "autoskill_with_library", "autoskill_without_library"
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

def find_run_path(memory_path):
    """Find the run folder path - handles both start_at_* subfolder and direct file structure"""
    try:
        run_folders = [f for f in os.listdir(memory_path) if f.startswith("start_at_")]
        if run_folders:
            return os.path.join(memory_path, run_folders[0])
        # If no start_at_* folder, check if summary.json exists directly in memory_path
        if os.path.exists(os.path.join(memory_path, "summary.json")):
            return memory_path
        return None
    except:
        return None

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

# Memory systems to exclude from processing
# Note: autoskill (without suffix) is excluded, but autoskill_with_library and autoskill_without_library are included
EXCLUDED_MEMORY_SYSTEMS = []

# Cases that use avg_score (0-1 range) for display metric
CASES_WITH_AVG_SCORE = [
    "domain/Academic&Knowledge",
    "domain/Open-Domain",
    "task/Long-Long",
    "task/Short-Long"
]

# Cases that use reasoning_bert_score for display metric
CASES_WITH_REASONING_BERT = [
    "domain/Legal"
]

# Cases that use bert_score for display metric
CASES_WITH_BERT_SCORE = [
    "task/Long-Short"
]

# Cases that use BERTScore-F1 for display metric
CASES_WITH_BERTSCORE_F1 = [
    "task/Short-Short"
]

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

    # Process cases - filter out excluded models and memory systems
    for case_key, case_data in elo_raw.get("cases", {}).items():
        filtered_elo = {}
        for system_key, elo_value in case_data.get("elo", {}).items():
            # Skip systems with excluded models
            if any(excluded in system_key for excluded in EXCLUDED_MODELS):
                continue
            # Skip systems with excluded memory systems
            if any(excluded in system_key for excluded in EXCLUDED_MEMORY_SYSTEMS):
                continue
            filtered_elo[system_key] = elo_value
        elo_data["cases"][case_key] = {
            "elo": filtered_elo,
            "n_systems": len(filtered_elo),
            "n_samples": case_data.get("n_samples", 0)
        }

    # Process overall_elo - filter out excluded models and memory systems
    for system_key, stats in elo_raw.get("overall_elo", {}).items():
        if any(excluded in system_key for excluded in EXCLUDED_MODELS):
            continue
        if any(excluded in system_key for excluded in EXCLUDED_MEMORY_SYSTEMS):
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
                    # Skip excluded memory systems
                    if memory_sys in EXCLUDED_MEMORY_SYSTEMS:
                        continue
                    memory_path = os.path.join(case_path, memory_sys)
                    if not os.path.isdir(memory_path):
                        continue

                    # Find the run folder (handles both start_at_* subfolder and direct structure)
                    run_path = find_run_path(memory_path)
                    if not run_path:
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
                    # Skip excluded memory systems
                    if memory_sys in EXCLUDED_MEMORY_SYSTEMS:
                        continue
                    memory_path = os.path.join(case_path, memory_sys)
                    if not os.path.isdir(memory_path):
                        continue

                    # Find the run folder (handles both start_at_* subfolder and direct structure)
                    run_path = find_run_path(memory_path)
                    if not run_path:
                        continue

                    predict_file = os.path.join(run_path, "predict.json")
                    summary_file = os.path.join(run_path, "summary.json")
                    eval_file = os.path.join(run_path, "evaluate_details.json")

                    if not os.path.exists(predict_file):
                        continue

                    try:
                        predict_data = load_json(predict_file)

                        # Build dataset -> scores mapping from summary.details
                        # summary.details[dataset] arrays are in the same order as evaluate_details for that dataset
                        dataset_scores = {}  # dataset_name -> [raw_scores]
                        if os.path.exists(summary_file):
                            summary = load_json(summary_file)
                            for dataset_name, score_list in summary.get("details", {}).items():
                                dataset_scores[dataset_name] = score_list

                        # Load eval data if exists - build {dataset_test_idx: {dataset, metrics, raw_score}}
                        eval_data = {}  # "dataset_test_idx" -> {dataset, metrics, raw_score}
                        if os.path.exists(eval_file):
                            eval_raw = load_json(eval_file)
                            # First pass: count items per dataset to track indices
                            dataset_counts = {}
                            for e in eval_raw:
                                ds = e.get("dataset", "")
                                if ds not in dataset_counts:
                                    dataset_counts[ds] = 0
                                dataset_counts[ds] += 1

                            # Second pass: build mapping with string key "dataset_test_idx"
                            dataset_indices = {ds: 0 for ds in dataset_counts}
                            for e in eval_raw:
                                test_idx = e.get("test_idx")
                                if test_idx is not None:
                                    ds = e.get("dataset", "")
                                    idx_in_ds = dataset_indices.get(ds, 0)
                                    dataset_indices[ds] = idx_in_ds + 1

                                    # Get raw score from summary.details for this dataset and index
                                    raw_score = None
                                    if ds in dataset_scores and idx_in_ds < len(dataset_scores[ds]):
                                        raw_score = dataset_scores[ds][idx_in_ds]

                                    key = f"{ds}_{test_idx}"
                                    eval_data[key] = {
                                        "dataset": ds,
                                        "metrics": e.get("metrics", {}),
                                        "raw_score": raw_score
                                    }

                        # Process each predict item
                        for idx, p in enumerate(predict_data):
                            test_idx = p.get("test_idx", 0)
                            dataset_name = p.get("dataset", "")

                            # Get eval data by "dataset_test_idx" for accurate matching
                            key = f"{dataset_name}_{test_idx}"
                            eval_item = eval_data.get(key, {})
                            metrics = eval_item.get("metrics", {}) if eval_item else {}
                            raw_score = eval_item.get("raw_score")

                            # Skip if metrics is empty
                            if not metrics or len(metrics) == 0:
                                continue

                            # Determine which score field to use based on case type
                            use_avg_score = case_key in CASES_WITH_AVG_SCORE
                            use_reasoning_bert = case_key in CASES_WITH_REASONING_BERT
                            use_bert_score = case_key in CASES_WITH_BERT_SCORE
                            use_bertscore_f1 = case_key in CASES_WITH_BERTSCORE_F1

                            # Filter based on case type and score must be > 0
                            score_metric = None
                            if use_avg_score:
                                if 'avg_score' not in metrics or metrics['avg_score'] is None:
                                    continue
                                avg_score = metrics['avg_score']
                                if not isinstance(avg_score, (int, float)) or avg_score < 0 or avg_score > 1:
                                    continue
                                if avg_score == 0:
                                    continue
                                score_metric = 'avg_score'
                            elif use_reasoning_bert:
                                if 'reasoning_bert_score' not in metrics or metrics['reasoning_bert_score'] is None:
                                    continue
                                reasoning_bert = metrics['reasoning_bert_score']
                                if reasoning_bert == 0:
                                    continue
                                score_metric = 'reasoning_bert_score'
                            elif use_bert_score:
                                if 'bert_score' not in metrics or metrics['bert_score'] is None:
                                    continue
                                bert_score = metrics['bert_score']
                                if bert_score == 0:
                                    continue
                                score_metric = 'bert_score'
                            elif use_bertscore_f1:
                                if 'BERTScore-F1' not in metrics or metrics['BERTScore-F1'] is None:
                                    continue
                                bertscore_f1 = metrics['BERTScore-F1']
                                if bertscore_f1 == 0:
                                    continue
                                score_metric = 'BERTScore-F1'
                            else:
                                # Default: look for any valid score
                                if 'avg_score' in metrics and metrics['avg_score'] is not None and metrics['avg_score'] != 0:
                                    score_metric = 'avg_score'
                                elif 'rougel' in metrics and metrics['rougel'] is not None and metrics['rougel'] != 0:
                                    score_metric = 'rougel'
                                elif 'f1' in metrics and metrics['f1'] is not None and metrics['f1'] != 0:
                                    score_metric = 'f1'
                                else:
                                    continue

                            # Use original score directly for display (no normalization)
                            # For avg_score cases: use raw_score from details
                            # For reasoning_bert/bert_score/BERTScore-F1 cases: use the value directly from metrics
                            display_score = None
                            if use_avg_score:
                                # Use raw_score from details array directly
                                display_score = raw_score
                            elif use_reasoning_bert:
                                reasoning_bert_val = metrics.get('reasoning_bert_score', 0)
                                display_score = reasoning_bert_val if isinstance(reasoning_bert_val, (int, float)) else 0
                            elif use_bert_score:
                                bert_score_val = metrics.get('bert_score', 0)
                                display_score = bert_score_val if isinstance(bert_score_val, (int, float)) else 0
                            elif use_bertscore_f1:
                                bertscore_f1_val = metrics.get('BERTScore-F1', 0)
                                display_score = bertscore_f1_val if isinstance(bertscore_f1_val, (int, float)) else 0
                            else:
                                # Default: use rougel or any available score
                                rougel = metrics.get('rougel', 0)
                                if isinstance(rougel, (int, float)) and rougel > 0:
                                    display_score = rougel
                                else:
                                    display_score = sample.get('display_score')

                            # Keep full messages without truncation
                            simplified_messages = p.get("messages", [])

                            # Keep full response without truncation
                            response = p.get("response", "") if p.get("response") else ""

                            # Create sample
                            # metric_type: 'avg_score', 'reasoning_bert_score', or 'f1' - tells frontend which metric to display
                            # display_score: the score for sorting/display
                            sample = {
                                "test_idx": test_idx,
                                "model": model_id,
                                "case_type": case_type,
                                "case_name": case_name,
                                "memory_system": memory_sys,
                                "system_key": f"{memory_sys}-{model_id}",
                                "dataset": eval_item.get("dataset", p.get("dataset", "")),
                                "messages": simplified_messages,
                                "response": response,
                                "metrics": metrics if metrics else {},
                                "metric_type": score_metric,
                                "display_score": display_score,
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
        # Filter out samples with null display_score
        valid_samples = [s for s in samples if s.get("display_score") is not None]

        if len(valid_samples) <= TARGET_SAMPLES:
            limited_samples[case_key] = valid_samples
            continue

        # Get scores for stratification
        scores = [s["display_score"] for s in valid_samples]
        min_score, max_score = min(scores), max(scores)

        # If all scores are the same, just take the first TARGET_SAMPLES
        if max_score == min_score:
            limited_samples[case_key] = valid_samples[:TARGET_SAMPLES]
            continue

        # Divide into 4 ranges and sample proportionally from each
        ranges = [
            (min_score, min_score + (max_score - min_score) * 0.25),
            (min_score + (max_score - min_score) * 0.25, min_score + (max_score - min_score) * 0.5),
            (min_score + (max_score - min_score) * 0.5, min_score + (max_score - min_score) * 0.75),
            (min_score + (max_score - min_score) * 0.75, max_score)
        ]

        range_samples = [[] for _ in ranges]
        for s in valid_samples:
            score = s["display_score"]
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
            range_samps.sort(key=lambda x: x["display_score"])
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

        # Filter out excluded models and memory systems from systems
        if "systems" in overall_data:
            filtered_systems = {}
            for key, val in overall_data["systems"].items():
                if any(excluded in key for excluded in EXCLUDED_MODELS):
                    continue
                if any(excluded in key for excluded in EXCLUDED_MEMORY_SYSTEMS):
                    continue
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

            # Filter systems (exclude models and memory systems)
            filtered_systems = {}
            if "systems" in case_data:
                for key, val in case_data["systems"].items():
                    if any(excluded in key for excluded in EXCLUDED_MODELS):
                        continue
                    if any(excluded in key for excluded in EXCLUDED_MEMORY_SYSTEMS):
                        continue
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
        {"id": "uno", "name": "Uno", "description": "Uno记忆系统"},
        {"id": "uno-single", "name": "Uno-Single", "description": "Uno-Single记忆系统"},
        {"id": "autoskill_with_library", "name": "AutoSkill (with library)", "description": "AutoSkill记忆系统（带工具库）"},
        {"id": "autoskill_without_library", "name": "AutoSkill (without library)", "description": "AutoSkill记忆系统（不带工具库）"}
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