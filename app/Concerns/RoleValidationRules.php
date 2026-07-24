<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait RoleValidationRules
{
    /**
     * Get the validation rules used to create or update a role.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function roleRules(?int $ignoreId = null): array
    {
        return [
            'name' => [
                'required',
                'string',
                'lowercase',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique(config('permission.table_names.roles'), 'name')
                    ->where('guard_name', 'web')
                    ->ignore($ignoreId),
            ],
            'permissions' => ['array'],
            'permissions.*' => [
                'string',
                Rule::exists(config('permission.table_names.permissions'), 'name')
                    ->where('guard_name', 'web'),
            ],
        ];
    }

    /**
     * Get the validation messages for the role rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.regex' => __('The role name may only contain lowercase letters, numbers and single hyphens.'),
        ];
    }
}
