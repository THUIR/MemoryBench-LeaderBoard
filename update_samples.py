import json
import os

def process_samples_folder(base_path, model_name):
    """Process predict.json and evaluate_details.json files"""
    samples_by_case = {}

    for root, dirs, files in os.walk(base_path):
        if '__MACOSX' in root or 'summary.json' not in files:
            continue

        parts = root.split(os.sep)
        try:
            if 'domain' in parts:
                idx = parts.index('domain')
                case_type = "domain"
                case_name = parts[idx + 1]
                memory = parts[idx + 2]
            elif 'task' in parts:
                idx = parts.index('task')
                case_type = "task"
                case_name = parts[idx + 1]
                memory = parts[idx + 2]
            else:
                continue
            case_key = f"{case_type}/{case_name}"
        except:
            continue

        predict_path = os.path.join(root, 'predict.json')
        eval_path = os.path.join(root, 'evaluate_details.json')

        predict_data, eval_data = [], []
        try:
            if os.path.exists(predict_path):
                with open(predict_path, 'r', encoding='utf-8') as f:
                    predict_data = json.load(f)
            if os.path.exists(eval_path):
                with open(eval_path, 'r', encoding='utf-8') as f:
                    eval_data = json.load(f)
        except Exception as e:
            print(f"    Error loading {root}: {e}")
            continue

        eval_lookup = {e["test_idx"]: e for e in eval_data}

        if case_key not in samples_by_case:
            samples_by_case[case_key] = []

        for p in predict_data:
            test_idx = p.get("test_idx")
            eval_item = eval_lookup.get(test_idx, {})

            # Simplify messages to only role and content
            messages = p.get("messages", [])
            simplified_messages = []
            for msg in messages:
                simplified_messages.append({
                    "role": msg.get("role", ""),
                    "content": msg.get("content", "")[:1000] if msg.get("content") else ""
                })

            # Get metrics - use entire metrics object to preserve all fields
            eval_metrics = eval_item.get("metrics", {})

            sample = {
                "test_idx": test_idx,
                "model": model_name,
                "case_type": case_type,
                "case_name": case_name,
                "memory_system": memory,
                "dataset": eval_item.get("dataset", ""),
                "messages": simplified_messages,
                "response": p.get("response", "") if p.get("response") else "",
                "metrics": eval_metrics,
                "eval_details": {
                    "exp_reasoning": eval_metrics.get("exp_reasoning", ""),
                    "gen_reasoning": eval_metrics.get("gen_reasoning", ""),
                    "golden_answer": eval_metrics.get("golden_answer", ""),
                    "evidence": eval_metrics.get("evidence", [])
                }
            }
            samples_by_case[case_key].append(sample)

    return samples_by_case

def main():
    base_dir = r"D:\Git\memorybench\20260601新数据"
    output_dir = r"D:\Git\memorybench\src\data\samples"
    os.makedirs(output_dir, exist_ok=True)

    all_data = {}

    model_folders = [
        ("off-policy-DeepSeek-V4-Flash", "DeepSeek-V4-Flash"),
        ("off-policy-Mistral-Small-3.2-24B-Instruct-2506", "Mistral-Small-3.2-24B-Instruct-2506"),
        ("off-policy-Qwen3-32B", "Qwen3-32B"),
        ("off-policy-Qwen3-8B", "Qwen3-8B"),
    ]

    for folder_name, model_name in model_folders:
        folder_path = os.path.join(base_dir, folder_name)
        if not os.path.exists(folder_path):
            print(f"Folder not found: {folder_path}")
            continue

        print(f"Processing {folder_name} ({model_name})...")
        case_data = process_samples_folder(folder_path, model_name)

        for case_key, samples in case_data.items():
            if case_key not in all_data:
                all_data[case_key] = []
            all_data[case_key].extend(samples)

        print(f"  Total samples so far: {sum(len(v) for v in all_data.values())}")

    # Save each case as separate file (all samples, no limit)
    for case_key, samples in sorted(all_data.items()):
        safe_name = case_key.replace("/", "_").replace("&", "_")
        output_path = os.path.join(output_dir, f"{safe_name}.json")

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(samples, f, indent=2, ensure_ascii=False)

        print(f"  {case_key}: {len(samples)} samples -> {safe_name}.json")

    # Generate index file
    index_content = "// Auto-generated index\nexport const caseList = " + json.dumps(sorted(all_data.keys()), indent=2) + ";\n"

    index_path = os.path.join(output_dir, "index.js")
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)

    print(f"\nTotal cases: {len(all_data)}")
    print(f"Index saved to: {index_path}")

if __name__ == "__main__":
    main()