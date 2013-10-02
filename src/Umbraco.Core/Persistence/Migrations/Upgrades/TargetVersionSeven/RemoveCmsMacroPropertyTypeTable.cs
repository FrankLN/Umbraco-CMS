﻿using System;
using Umbraco.Core.Configuration;

namespace Umbraco.Core.Persistence.Migrations.Upgrades.TargetVersionSeven
{
    [Migration("7.0.0", 8, GlobalSettings.UmbracoMigrationName)]
    public class RemoveCmsMacroPropertyTypeTable : MigrationBase
    {
        public override void Up()
        {
            Delete.Table("cmsMacroPropertyType");
        }

        public override void Down()
        {
            throw new NotSupportedException("Cannot downgrade from a version 7 database to a prior version");
        }
    }
}