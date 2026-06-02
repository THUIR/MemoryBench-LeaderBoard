import json
import os

def process_summary_folders(base_path, model_name):
    """Process summary.json files from all model folders"""
    summary_data = {}

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

        summary_path = os.path.join(root, 'summary.json')
        try:
            with open(summary_path, 'r', encoding='utf-8') as f:
                summary = json.load(f)
        except Exception as e:
            print(f"  Error loading {summary_path}: {e}")
            continue

        system_key = f"{memory}-{model_name}"
        if case_key not in summary_data:
            summary_data[case_key] = {}
        summary_data[case_key][system_key] = {
            "weighted_average": summary.get("summary", {}).get("weighted_average", 0),
            "z_score": summary.get("summary", {}).get("z_score", 0)
        }

    return summary_data

def main():
    base_dir = r"D:\Git\memorybench\20260601新数据"
    output_file = r"D:\Git\memorybench\src\data\summaryAverages.json"

    all_summary = {}

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
        summary_data = process_summary_folders(folder_path, model_name)

        for case_key, systems in summary_data.items():
            if case_key not in all_summary:
                all_summary[case_key] = {}
            all_summary[case_key].update(systems)

        print(f"  Found {len(summary_data)} cases")

    # Write the updated summaryAverages.json
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_summary, f, indent=2, ensure_ascii=False)

    print(f"\nUpdated {output_file}")
    print(f"Total cases: {len(all_summary)}")
    for case, systems in all_summary.items():
        print(f"  {case}: {len(systems)} systems")

if __name__ == "__main__":
    main()